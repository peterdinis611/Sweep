import { randomUUID } from "node:crypto"
import { buildReport, humanPsiError, parseField, runPagespeed, type PsiResponse } from "@/analysis/pagespeed"
import { runLocalPair } from "@/analysis/lighthouse"
import { findLatestByUrl, saveReport } from "@/analysis/store"
import { saveCrawl } from "@/analysis/crawl-store"
import { fetchSitemapUrls } from "@/analysis/sitemap"
import { normalizeBudget } from "@/analysis/budget"
import { clearJobProgress, setJobProgress } from "@/analysis/progress"
import type { AnalysisEngine, Budget, Crawl, CrawlItem, FieldMetric, Report } from "@/analysis/types"
import { DEFAULT_BUDGET } from "@/analysis/types"

let queue: Promise<unknown> = Promise.resolve()

/** Jedno lokálne Lighthouse meranie naraz — Chrome je ťažký. */
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

export async function runAnalysis(
  url: string,
  budgetInput?: Partial<Budget>,
  jobId?: string,
  opts?: { retainProgress?: boolean },
): Promise<Report> {
  return enqueue(async () => {
    const ac = new AbortController()
    const timer = setTimeout(() => ac.abort(), 170_000)
    const hasPsiKey = Boolean(process.env.PAGESPEED_API_KEY?.trim())
    const budget = normalizeBudget(budgetInput ?? DEFAULT_BUDGET)

    try {
      setJobProgress(jobId, { phase: "verify", pct: 4, url })

      let mobile: PsiResponse
      let desktop: PsiResponse
      let engine: AnalysisEngine = "lighthouse"
      let fieldOverride: FieldMetric[] | undefined

      try {
        const pair = await runLocalPair(url, ac.signal, (phase) => {
          setJobProgress(jobId, {
            phase,
            pct: phase === "mobile" ? 18 : 55,
            url,
          })
        })
        mobile = pair.mobile
        desktop = pair.desktop
      } catch (localErr) {
        if (ac.signal.aborted) throw localErr
        const localMessage = localErr instanceof Error ? localErr.message : String(localErr)

        if (!hasPsiKey || !isMissingBrowser(localMessage)) {
          throw localErr instanceof Error ? localErr : new Error(localMessage)
        }

        try {
          setJobProgress(jobId, { phase: "mobile", pct: 20, url })
          const pair = await runPsiPair(url, ac.signal)
          mobile = pair.mobile
          desktop = pair.desktop
          engine = "psi"
          console.warn("[sweep] lokálne Lighthouse nedostupné, použité PSI API")
        } catch (psiErr) {
          const raw = psiErr instanceof Error ? psiErr.message : String(psiErr)
          throw new Error(humanPsiError(raw))
        }
      }

      if (engine === "lighthouse" && hasPsiKey) {
        try {
          setJobProgress(jobId, { phase: "field", pct: 82, url })
          const psi = await runPagespeed(url, "mobile", ac.signal)
          const field = parseField(psi)
          if (field.length) fieldOverride = field
        } catch {
          /* CrUX enrichment is optional */
        }
      }

      setJobProgress(jobId, { phase: "report", pct: 92, url })
      const id = randomUUID()
      const previous = await findLatestByUrl(url)
      const report = buildReport(id, url, mobile, desktop, {
        engine,
        previousId: previous?.id,
        budget,
        field: fieldOverride,
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
  opts?: { limit?: number; budget?: Partial<Budget>; jobId?: string },
): Promise<Crawl> {
  const budget = normalizeBudget(opts?.budget ?? DEFAULT_BUDGET)
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
      const report = await runAnalysis(url, budget, jobId, { retainProgress: true })
      item.reportId = report.id
      item.mobileScore = report.mobile.score
      item.desktopScore = report.desktop.score
      item.budgetPassed = report.budgetResult.mobile.passed && report.budgetResult.desktop.passed
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
