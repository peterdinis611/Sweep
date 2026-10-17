import { listCrawls } from "@/analysis/crawl-store"
import { expiresInDays, listReports } from "@/analysis/store"
import type { LabListItem } from "@/analysis/types"

function hostOf(url: string) {
  try {
    return new URL(url.includes("://") ? url : `https://${url}`).hostname
  } catch {
    return url.slice(0, 48)
  }
}

export async function listRecentLabs(limit = 30): Promise<LabListItem[]> {
  const [reports, crawls] = await Promise.all([listReports(limit), listCrawls(limit)])
  const items: LabListItem[] = [
    ...reports.flatMap((r) => {
      if (!r?.id || !r.createdAt) return []
      const mobilePass = r.budgetResult?.mobile?.passed
      const desktopPass = r.budgetResult?.desktop?.passed
      const passed =
        typeof mobilePass === "boolean" && typeof desktopPass === "boolean"
          ? mobilePass && desktopPass
          : undefined
      return [
        {
          kind: "report" as const,
          id: r.id,
          host: hostOf(r.finalUrl || r.url || ""),
          url: r.finalUrl || r.url || "",
          createdAt: r.createdAt,
          score: r.mobile?.score,
          passed,
          expiresInDays: expiresInDays(r.createdAt),
          href: `/r/${r.id}`,
        },
      ]
    }),
    ...crawls.map((c) => {
      const scored = c.items.filter((i) => i.mobileScore != null)
      const avg =
        scored.length > 0
          ? Math.round(scored.reduce((n, i) => n + (i.mobileScore ?? 0), 0) / scored.length)
          : undefined
      const passed = c.items.filter((i) => i.budgetPassed).length
      const failed = c.items.filter((i) => i.reportId && !i.budgetPassed).length
      return {
        kind: "crawl" as const,
        id: c.id,
        host: hostOf(c.sitemapUrl),
        url: c.sitemapUrl,
        createdAt: c.createdAt,
        score: avg,
        passed: failed === 0 && passed > 0,
        expiresInDays: expiresInDays(c.createdAt),
        href: `/c/${c.id}`,
      }
    }),
  ]
  items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  return items.slice(0, limit)
}
