import { randomUUID } from "node:crypto"
import {
  buildReport,
  buildRunStats,
  humanPsiError,
  parseField,
  runPagespeed,
  type PsiResponse,
} from "@/analysis/pagespeed"
import { runLocalPair } from "@/analysis/lighthouse"
import { findLatestByUrl, saveReport } from "@/analysis/store"
import { saveCrawl } from "@/analysis/crawl-store"
import { fetchSitemapUrls } from "@/analysis/sitemap"
import { resolveBudget } from "@/analysis/budget-file"
import { clearJobProgress, setJobProgress } from "@/analysis/progress"
import { saveRawLhr } from "@/analysis/lhr-store"
import type {
  AnalysisEngine,
  Budget,
  Crawl,
  CrawlItem,
  FieldMetric,
  LabHeaders,
  OpportunityMatrixRow,
  Report,
  ThrottlePreset,
} from "@/analysis/types"

let queue: Promise<unknown> = Promise.resolve()

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn)
  queue = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

async function runPsiPair(url: string, signal?: AbortSignal) {
  const mobile = await runPagespeed(url, "mobile", signal)
  const desktop = await runPagespeed(url, "desktop", signal)
  return { mobile, desktop }
}

function isMissingBrowser(message: string) {
  const m = message.toLowerCase()
  return m.includes("nenašiel som prehliadač") || m.includes("no chrome") || m.includes("err_launcher")
}

export type AnalysisOptions = {
  retainProgress?: boolean
  throttle?: ThrottlePreset
  headers?: LabHeaders
  /** Mobile median runs (1–5). */
  runs?: number
  saveRawLhr?: boolean
}

export async function runAnalysis(
  url: string,
  budgetInput?: Partial<Budget>,
  jobId?: string,
  opts?: AnalysisOptions,
): Promise<Report> {
  return enqueue(async () => {
    const ac = new AbortController()
    const runs = Math.min(5, Math.max(1, opts?.runs ?? 1))
    const timeoutMs = 170_000 + (runs - 1) * 90_000
    const timer = setTimeout(() => ac.abort(), timeoutMs)
    const hasPsiKey = Boolean(process.env.PAGESPEED_API_KEY?.trim())
    const { budget } = await resolveBudget(budgetInput)
    const throttle = opts?.throttle ?? "mobileDefault"
    const saveLhr = opts?.saveRawLhr !== false

    try {
      setJobProgress(jobId, { phase: "verify", pct: 4, url })

      let mobile: PsiResponse
      let desktop: PsiResponse
      let mobileRuns: PsiResponse[] = []
      let engine: AnalysisEngine = "lighthouse"
      let fieldOverride: FieldMetric[] | undefined

      try {
        const pair = await runLocalPair(url, {
          signal: ac.signal,
          throttle,
          headers: opts?.headers,
          mobileRuns: runs,
          onPhase: (phase) => {
            setJobProgress(jobId, {
              phase,
              pct: phase === "mobile" ? 18 : 55,
              url,
            })
          },
        })
        mobile = pair.mobile
        desktop = pair.desktop
        mobileRuns = pair.mobileRuns
      } catch (localErr) {
        if (ac.signal.aborted) throw localErr
        const localMessage = localErr instanceof Error ? localErr.message : String(localErr)

        if (!hasPsiKey || !isMissingBrowser(localMessage) || opts?.headers) {
          // Headers require local Chrome — don't silently fall back to PSI
          throw localErr instanceof Error ? localErr : new Error(localMessage)
        }

        try {
          setJobProgress(jobId, { phase: "mobile", pct: 20, url })
          const pair = await runPsiPair(url, ac.signal)
          mobile = pair.mobile
          desktop = pair.desktop
          mobileRuns = [mobile]
          engine = "psi"
          console.warn("[sweep] lokálne Lighthouse nedostupné, použité PSI API")
        } catch (psiErr) {
          const raw = psiErr instanceof Error ? psiErr.message : String(psiErr)
          throw new Error(humanPsiError(raw))
        }
      }

      if (engine === "lighthouse" && hasPsiKey && !opts?.headers) {
        try {
          setJobProgress(jobId, { phase: "field", pct: 82, url })
          const psi = await runPagespeed(url, "mobile", ac.signal)
          const field = parseField(psi)
          if (field.length) fieldOverride = field
        } catch {
          /* optional */
        }
      }

      setJobProgress(jobId, { phase: "report", pct: 92, url })
      const id = randomUUID()
      let hasRaw = false
      if (saveLhr && engine === "lighthouse") {
        try {
          await saveRawLhr(id, "mobile", mobile.lighthouseResult)
          await saveRawLhr(id, "desktop", desktop.lighthouseResult)
          hasRaw = true
        } catch {
          /* optional */
        }
      }

      const previous = await findLatestByUrl(url)
      const report = buildReport(id, url, mobile, desktop, {
        engine,
        previousId: previous?.id,
        budget,
        field: fieldOverride,
        throttle,
        runs,
        hasRawLhr: hasRaw,
        mobileRunStats: buildRunStats(mobileRuns),
      })
      await saveReport(report)
      setJobProgress(jobId, { phase: "report", pct: 100, url })
      return report
    } catch (e) {
      if (ac.signal.aborted) {
        throw new Error("Meranie vypršalo. Skús to znova.")
      }
      throw e instanceof Error ? e : new Error("Analýza zlyhala.")
    } finally {
      clearTimeout(timer)
      if (!opts?.retainProgress) clearJobProgress(jobId)
    }
  })
}

export async function runSitemapCrawl(
  sitemapUrl: string,
  opts?: {
    limit?: number
    budget?: Partial<Budget>
    jobId?: string
    throttle?: ThrottlePreset
    headers?: LabHeaders
    runs?: number
  },
): Promise<Crawl> {
  const { budget } = await resolveBudget(opts?.budget)
  const limit = Math.min(8, Math.max(1, opts?.limit ?? 5))
  const jobId = opts?.jobId

  setJobProgress(jobId, { phase: "verify", pct: 2, url: sitemapUrl })
  const urls = await fetchSitemapUrls(sitemapUrl, limit)
  const crawl: Crawl = {
    id: randomUUID(),
    sitemapUrl,
    createdAt: new Date().toISOString(),
    budget,
    items: [],
  }

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]!
    const current = i + 1
    const total = urls.length
    const basePct = Math.round((i / total) * 92)
    setJobProgress(jobId, {
      phase: "crawl",
      pct: Math.max(4, basePct),
      url,
      current,
      total,
    })

    const item: CrawlItem = { url }
    try {
      const report = await runAnalysis(url, budget, jobId, {
        retainProgress: true,
        throttle: opts?.throttle,
        headers: opts?.headers,
        runs: opts?.runs ?? 1,
      })
      item.reportId = report.id
      item.mobileScore = report.mobile.score
      item.desktopScore = report.desktop.score
      item.budgetPassed = report.budgetResult.mobile.passed && report.budgetResult.desktop.passed
      item.opportunityIds = report.mobile.opportunities.slice(0, 20).map((o) => o.id)
      crawl.opportunityMatrix = mergeOpportunityMatrix(crawl.opportunityMatrix, report, url)
    } catch (e) {
      item.error = e instanceof Error ? e.message : "Meranie zlyhalo."
    }
    crawl.items.push(item)
    await saveCrawl(crawl)
    setJobProgress(jobId, {
      phase: "crawl",
      pct: Math.round((current / total) * 96),
      url,
      current,
      total,
    })
  }

  clearJobProgress(jobId)
  return crawl
}

function mergeOpportunityMatrix(
  prev: OpportunityMatrixRow[] | undefined,
  report: Report,
  pageUrl: string,
): OpportunityMatrixRow[] {
  const map = new Map((prev ?? []).map((r) => [r.id, { ...r, urls: [...r.urls] }]))
  for (const o of report.mobile.opportunities.slice(0, 20)) {
    const row = map.get(o.id) ?? { id: o.id, title: o.title, count: 0, urls: [] }
    row.title = o.title
    row.count += 1
    if (!row.urls.includes(pageUrl)) row.urls.push(pageUrl)
    map.set(o.id, row)
  }
  return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 24)
}
