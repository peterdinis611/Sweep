import { randomUUID } from "node:crypto"
import { buildReport, humanPsiError, runPagespeed, type PsiResponse } from "@/analysis/pagespeed"
import { runLocalPair } from "@/analysis/lighthouse"
import { findLatestByUrl, saveReport } from "@/analysis/store"
import type { AnalysisEngine, Report } from "@/analysis/types"

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

export async function runAnalysis(url: string): Promise<Report> {
  return enqueue(async () => {
    const ac = new AbortController()
    const timer = setTimeout(() => ac.abort(), 170_000)
    const hasPsiKey = Boolean(process.env.PAGESPEED_API_KEY?.trim())

    try {
      let mobile: PsiResponse
      let desktop: PsiResponse
      let engine: AnalysisEngine = "lighthouse"

      try {
        const pair = await runLocalPair(url, ac.signal)
        mobile = pair.mobile
        desktop = pair.desktop
      } catch (localErr) {
        if (ac.signal.aborted) throw localErr
        const localMessage = localErr instanceof Error ? localErr.message : String(localErr)

        if (!hasPsiKey || !isMissingBrowser(localMessage)) {
          throw localErr instanceof Error ? localErr : new Error(localMessage)
        }

        try {
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

      const id = randomUUID()
      const previous = await findLatestByUrl(url)
      const report = buildReport(id, url, mobile, desktop, {
        engine,
        previousId: previous?.id,
      })
      await saveReport(report)
      return report
    } catch (e) {
      if (ac.signal.aborted) {
        throw new Error("Meranie vypršalo. Skús to znova.")
      }
      throw e instanceof Error ? e : new Error("Analýza zlyhala.")
    } finally {
      clearTimeout(timer)
    }
  })
}
