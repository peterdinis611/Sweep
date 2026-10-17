import type { CriticalPath, CriticalRequest } from "@/analysis/types"

type AuditMap = Record<
  string,
  { details?: { items?: unknown[]; chains?: Record<string, unknown>; data?: string } } | undefined
>

/** Extract LCP element + critical-request chain from a Lighthouse LHR audits map. */
export function extractCriticalPath(audits: AuditMap): CriticalPath {
  const lcpAudit = audits["largest-contentful-paint-element"]
  const lcpItems = (lcpAudit?.details?.items ?? []) as Record<string, unknown>[]
  const first = lcpItems[0] ?? {}
  const node = (first.node ?? first) as Record<string, unknown>
  const lcpElement =
    typeof node.snippet === "string"
      ? node.snippet
      : typeof node.nodeLabel === "string"
        ? node.nodeLabel
        : typeof first.nodeLabel === "string"
          ? String(first.nodeLabel)
          : undefined

  const chainAudit = audits["critical-request-chains"] ?? audits["priority-hints"]
  const chains = (chainAudit?.details?.chains ?? {}) as Record<
    string,
    { request?: { url?: string; startTime?: number; endTime?: number; transferSize?: number; resourceType?: string }; children?: unknown }
  >

  const requests: CriticalRequest[] = []
  const walk = (node: {
    request?: { url?: string; startTime?: number; endTime?: number; transferSize?: number; resourceType?: string }
    children?: Record<string, unknown>
  }) => {
    const r = node.request
    if (r?.url) {
      const start = Number(r.startTime ?? 0)
      const end = Number(r.endTime ?? start)
      requests.push({
        url: r.url,
        transferSize: Number(r.transferSize ?? 0),
        start: start * (start < 100 ? 1000 : 1),
        duration: Math.max(0, (end - start) * (start < 100 ? 1000 : 1)),
        type: String(r.resourceType ?? "Other"),
      })
    }
    const children = node.children
    if (children && typeof children === "object") {
      for (const child of Object.values(children)) {
        walk(child as typeof node)
      }
    }
  }
  for (const chain of Object.values(chains)) {
    walk(chain as never)
  }

  // Fallback: top transfer sizes from network-requests near LCP timing
  if (!requests.length) {
    const net = (audits["network-requests"]?.details?.items ?? []) as Record<string, unknown>[]
    const sorted = [...net]
      .map((item) => ({
        url: String(item.url ?? ""),
        transferSize: Number(item.transferSize ?? 0),
        start: Number(item.networkRequestTime ?? item.startTime ?? 0),
        duration: Math.max(
          1,
          Number(item.networkEndTime ?? item.endTime ?? 0) - Number(item.networkRequestTime ?? item.startTime ?? 0),
        ),
        type: String(item.resourceType ?? "Other"),
      }))
      .filter((r) => r.url && r.transferSize > 0)
      .sort((a, b) => b.transferSize - a.transferSize)
      .slice(0, 8)
    requests.push(...sorted)
  }

  const lcpUrlAudit = audits["lcp-lazy-loaded"] ?? audits["prioritize-lcp-image"]
  const lcpUrl =
    typeof (lcpUrlAudit?.details?.items as { url?: string }[] | undefined)?.[0]?.url === "string"
      ? (lcpUrlAudit!.details!.items as { url: string }[])[0]!.url
      : requests[0]?.url

  return {
    lcpElement: lcpElement?.slice(0, 240),
    lcpUrl,
    lcpType: typeof node.nodeLabel === "string" ? undefined : undefined,
    requests: requests.slice(0, 12),
  }
}

export function median(nums: number[]): number {
  if (!nums.length) return 0
  const s = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2
}

export function spread(nums: number[]): number {
  if (nums.length < 2) return 0
  return Math.max(...nums) - Math.min(...nums)
}
