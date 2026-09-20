import type {
  CategoryScores,
  FieldMetric,
  Impact,
  Metric,
  Rating,
  Report,
  Strategy,
  StrategyReport,
  WaterfallItem,
  Budget,
} from "@/analysis/types"
import { DEFAULT_BUDGET } from "@/analysis/types"
import { evaluateBudget, normalizeBudget } from "@/analysis/budget"
import { buildImprovements, buildStrengths, localizeOpportunityTitles } from "@/analysis/insights"

const LABELS: Record<string, string> = {
  "render-blocking-resources": "Odstráň blokujúce CSS/JS",
  "unused-css-rules": "Odstráň nepoužívaný CSS",
  "unused-javascript": "Odstráň nepoužívaný JavaScript",
  "uses-optimized-images": "Komprimuj obrázky",
  "modern-image-formats": "Použi WebP / AVIF",
  "offscreen-images": "Odlož obrázky mimo obrazovky",
  "uses-text-compression": "Zapni textovú kompresiu (Brotli/gzip)",
  "uses-long-cache-ttl": "Zapni cache prehliadača",
  "server-response-time": "Skráť odozvu servera (TTFB)",
  redirects: "Odstráň zbytočné presmerovania",
  "unminified-css": "Minifikuj CSS",
  "unminified-javascript": "Minifikuj JavaScript",
  "efficient-animated-content": "Nenahrádzaj video animovaným GIFom",
  "uses-responsive-images": "Použi responzívne obrázky",
  "preload-lcp-image": "Prednačítaj LCP obrázok",
  "prioritize-lcp-image": "Prioritizuj LCP obrázok",
  "third-party-summary": "Obmedz skripty tretích strán",
  "dom-size": "Zmenši DOM",
  "font-display": "Nastav font-display",
  "legacy-javascript": "Odstráň starý JavaScript",
  "duplicated-javascript": "Odstráň duplicitný JS",
  "uses-rel-preconnect": "Pridaj preconnect na kľúčové origin",
  "uses-rel-preload": "Prednačítaj kľúčové požiadavky",
  "total-byte-weight": "Zníž celkovú veľkosť stránky",
  "bootup-time": "Skráť čas vykonávania JS",
  "mainthread-work-breakdown": "Zníž prácu na hlavnom vlákne",
  "lcp-lazy-loaded": "Nenačítavaj LCP obrázok lazy",
}

type PsiAudit = {
  id?: string
  title?: string
  description?: string
  score?: number | null
  displayValue?: string
  numericValue?: number
  scoreDisplayMode?: string
  details?: {
    type?: string
    overallSavingsMs?: number
    items?: Record<string, unknown>[]
    data?: string
  }
}

export type PsiResponse = {
  error?: { code?: number; message?: string }
  id?: string
  loadingExperience?: {
    metrics?: Record<string, { percentile?: number; category?: string }>
  }
  lighthouseResult?: {
    finalUrl?: string
    requestedUrl?: string
    fetchTime?: string
    runtimeError?: { code?: string; message?: string }
    categories?: {
      performance?: { score?: number | null }
      accessibility?: { score?: number | null }
      "best-practices"?: { score?: number | null }
      seo?: { score?: number | null }
    }
    audits?: Record<string, PsiAudit>
  }
}

function ratingMs(value: number, good: number, ni: number): Rating {
  if (value <= good) return "good"
  if (value <= ni) return "ni"
  return "poor"
}

function fieldRating(cat?: string): Rating {
  if (cat === "FAST") return "good"
  if (cat === "AVERAGE") return "ni"
  return "poor"
}

function metric(id: string, label: string, numeric: number, display: string, rating: Rating, unit: Metric["unit"] = "ms"): Metric {
  return { id, label, display, numeric, rating, unit }
}

function impactFrom(ms: number): Impact {
  if (ms >= 500) return "high"
  if (ms >= 120) return "medium"
  return "low"
}

function shortUrl(url: string) {
  try {
    const u = new URL(url)
    const path = u.pathname + u.search
    return (u.hostname + (path.length > 48 ? path.slice(0, 45) + "…" : path)).replace(/\/$/, "")
  } catch {
    return url.slice(0, 64)
  }
}

function parseStrategy(json: PsiResponse): StrategyReport {
  if (json.error?.message) {
    throw new Error(humanPsiError(json.error.message))
  }
  const lhr = json.lighthouseResult
  if (!lhr) throw new Error("PageSpeed nevrátil Lighthouse výsledok.")
  if (lhr.runtimeError?.message) throw new Error(humanPsiError(lhr.runtimeError.message))

  const audits = lhr.audits ?? {}
  const score = Math.round((lhr.categories?.performance?.score ?? 0) * 100)
  const categories = parseCategories(lhr.categories)

  const lcpN = num(audits["largest-contentful-paint"])
  const fcpN = num(audits["first-contentful-paint"])
  const clsN = num(audits["cumulative-layout-shift"])
  const tbtN = num(audits["total-blocking-time"])
  const siN = num(audits["speed-index"])
  const ttfbN = num(audits["server-response-time"]) || num(audits["time-to-first-byte"])

  const metricsItem = (audits["metrics"]?.details?.items?.[0] ?? {}) as Record<string, number>
  const ttfb = ttfbN || metricsItem.timeToFirstByte || 0

  const summary = audits["resource-summary"]?.details?.items as { resourceType?: string; requestCount?: number; transferSize?: number }[] | undefined
  const total = summary?.find((i) => i.resourceType === "total")
  const bytes = total?.transferSize ?? waterfallBytes(audits["network-requests"])
  const requests = total?.requestCount ?? waterfallCount(audits["network-requests"])

  const lcp = metric("lcp", "LCP", lcpN, formatMs(lcpN), ratingMs(lcpN, 2500, 4000))
  const tbt = metric("tbt", "TBT", tbtN, formatMs(tbtN), ratingMs(tbtN, 200, 600))
  const cls = metric("cls", "CLS", clsN, clsN.toFixed(3), clsN <= 0.1 ? "good" : clsN <= 0.25 ? "ni" : "poor", "score")
  const fcp = metric("fcp", "FCP", fcpN, formatMs(fcpN), ratingMs(fcpN, 1800, 3000))
  const ttfbMetric = metric("ttfb", "TTFB", ttfb, formatMs(ttfb), ratingMs(ttfb, 800, 1800))
  const speedIndex = metric("si", "Speed Index", siN, formatMs(siN), ratingMs(siN, 3400, 5800))
  const inpField = fieldInp(json)

  const metricBundle = [
    { id: "lcp", metric: lcp },
    { id: "tbt", metric: tbt },
    { id: "cls", metric: cls },
    { id: "fcp", metric: fcp },
    { id: "ttfb", metric: ttfbMetric },
    { id: "si", metric: speedIndex },
    ...(inpField ? [{ id: "inp" as const, metric: inpField }] : []),
  ]

  const opportunities = localizeOpportunityTitles(buildImprovements(audits, metricBundle), LABELS)
  const strengths = buildStrengths(audits, metricBundle, score)

  const waterfall: WaterfallItem[] = ((audits["network-requests"]?.details?.items ?? []) as Record<string, unknown>[])
    .map((item) => {
      const start = Number(item.networkRequestTime ?? item.startTime ?? 0)
      const end = Number(item.networkEndTime ?? item.endTime ?? start)
      return {
        url: String(item.url ?? ""),
        start: start * (start < 100 ? 1000 : 1),
        duration: Math.max(1, (end - start) * (start < 100 ? 1000 : 1)),
        transferSize: Number(item.transferSize ?? 0),
        status: Number(item.statusCode ?? 0),
        type: String(item.resourceType ?? item.mimeType ?? "Other"),
      }
    })
    .filter((r) => r.url)
    .slice(0, 90)

  // Lighthouse network times are often already in ms relative to nav start
  normalizeWaterfall(waterfall)

  const filmstrip = ((audits["screenshot-thumbnails"]?.details?.items ?? []) as { timing?: number; data?: string }[])
    .filter((f) => typeof f.data === "string" && f.data.length > 32)
    .map((f) => ({ timing: Number(f.timing ?? 0), data: f.data! }))
    .slice(0, 10)

  return {
    score,
    categories,
    lcp,
    inp: inpField,
    tbt,
    cls,
    fcp,
    ttfb: ttfbMetric,
    speedIndex,
    bytes,
    requests,
    opportunities,
    strengths,
    waterfall,
    screenshot: audits["final-screenshot"]?.details?.data,
    filmstrip,
  }
}

function parseCategories(cats?: {
  performance?: { score?: number | null }
  accessibility?: { score?: number | null }
  "best-practices"?: { score?: number | null }
  seo?: { score?: number | null }
} | null): CategoryScores {
  const scoreOf = (v?: { score?: number | null } | null) =>
    v?.score == null ? null : Math.round(v.score * 100)
  return {
    performance: scoreOf(cats?.performance) ?? 0,
    accessibility: scoreOf(cats?.accessibility),
    bestPractices: scoreOf(cats?.["best-practices"]),
    seo: scoreOf(cats?.seo),
  }
}

function fieldInp(json: PsiResponse): Metric | null {
  const m = json.loadingExperience?.metrics ?? {}
  const inp = m.INTERACTION_TO_NEXT_PAINT ?? m.INP
  const fid = m.FIRST_INPUT_DELAY_MS
  if (inp?.percentile != null) {
    const v = inp.percentile
    return metric("inp", "INP", v, formatMs(v), fieldRating(inp.category))
  }
  if (fid?.percentile != null) {
    const v = fid.percentile
    return metric("fid", "FID", v, formatMs(v), fieldRating(fid.category))
  }
  return null
}

export function parseField(json: PsiResponse): FieldMetric[] {
  const m = json.loadingExperience?.metrics ?? {}
  const map: [string, string, string][] = [
    ["LARGEST_CONTENTFUL_PAINT_MS", "lcp", "LCP (pole)"],
    ["INTERACTION_TO_NEXT_PAINT", "inp", "INP (pole)"],
    ["FIRST_INPUT_DELAY_MS", "fid", "FID (pole)"],
    ["CUMULATIVE_LAYOUT_SHIFT_SCORE", "cls", "CLS (pole)"],
    ["FIRST_CONTENTFUL_PAINT_MS", "fcp", "FCP (pole)"],
    ["EXPERIMENTAL_TIME_TO_FIRST_BYTE", "ttfb", "TTFB (pole)"],
  ]
  const out: FieldMetric[] = []
  for (const [key, id, label] of map) {
    const item = m[key]
    if (!item?.percentile && item?.percentile !== 0) continue
    const isCls = id === "cls"
    const raw = item.percentile
    const value = isCls ? raw / 100 : raw
    out.push({
      id,
      label,
      percentile: value,
      display: isCls ? value.toFixed(3) : formatMs(value),
      category: fieldRating(item.category),
    })
  }
  return out
}

function normalizeWaterfall(items: WaterfallItem[]) {
  if (!items.length) return
  const min = Math.min(...items.map((i) => i.start))
  if (min > 60_000) {
    for (const i of items) i.start -= min
  }
  const maxEnd = Math.max(...items.map((i) => i.start + i.duration))
  if (maxEnd < 120) {
    for (const i of items) {
      i.start *= 1000
      i.duration *= 1000
    }
  }
}

function waterfallBytes(audit?: PsiAudit) {
  const items = (audit?.details?.items ?? []) as { transferSize?: number }[]
  return items.reduce((n, i) => n + (i.transferSize ?? 0), 0)
}

function waterfallCount(audit?: PsiAudit) {
  return (audit?.details?.items ?? []).length
}

function num(audit?: PsiAudit) {
  return Math.round(audit?.numericValue ?? 0)
}

export function formatMs(ms: number) {
  if (ms >= 1000) return `${(ms / 1000).toFixed(ms >= 10_000 ? 1 : 2)} s`
  return `${Math.round(ms)} ms`
}

export function formatBytes(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} MB`
  if (n >= 1000) return `${(n / 1000).toFixed(0)} kB`
  return `${n} B`
}

function stripHtml(s: string) {
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
}

export function humanPsiError(message: string) {
  const m = message.toLowerCase()
  if (m.includes("failed_document_request") || m.includes("dns") || m.includes("net::")) {
    return "Stránka je nedostupná alebo odmietla meranie. Skontroluj URL a či je verejná."
  }
  if (m.includes("invalidargument") || (m.includes("invalid") && m.includes("url"))) {
    return "Neplatná URL adresa."
  }
  if (m.includes("timeout") || m.includes("timed out")) return "Meranie vypršalo. Skús to znova o chvíľu."
  if (m.includes("quota") || m.includes("rate") || m.includes("resource_exhausted") || m.includes("exceeded")) {
    return "Kvóta PageSpeed API je vyčerpaná. Do .env.local pridaj PAGESPEED_API_KEY (bezplatný kľúč v Google Cloud Console → PageSpeed Insights API)."
  }
  if (
    m.includes("something went wrong") ||
    m.includes("lighthouse returned error") ||
    m.includes("internal error") ||
    m.includes("backend error")
  ) {
    return "Vzdialené laboratórium (PageSpeed) teraz zlyhalo. Skús to znova — Sweep skúsi lokálne Lighthouse, ak je dostupný Chrome."
  }
  return message.slice(0, 220)
}

export function normalizeUrl(input: string) {
  const raw = input.trim()
  if (!raw) throw new Error("Zadaj URL adresu.")
  const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
  let url: URL
  try {
    url = new URL(withProto)
  } catch {
    throw new Error("Neplatná URL adresa.")
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Povolené sú len adresy http a https.")
  }
  return url.toString()
}

export function scoreTone(score: number): Rating {
  if (score >= 90) return "good"
  if (score >= 50) return "ni"
  return "poor"
}

const PSI = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"

export async function runPagespeed(url: string, strategy: Strategy, signal?: AbortSignal): Promise<PsiResponse> {
  const params = new URLSearchParams({
    url,
    strategy,
    locale: "sk",
  })
  for (const cat of ["performance", "accessibility", "best-practices", "seo"]) {
    params.append("category", cat)
  }
  const key = process.env.PAGESPEED_API_KEY
  if (key) params.set("key", key)

  const res = await fetch(`${PSI}?${params}`, {
    signal,
    headers: { Accept: "application/json" },
    cache: "no-store",
  })
  const json = (await res.json()) as PsiResponse
  if (!res.ok && json.error) throw new Error(humanPsiError(json.error.message ?? `HTTP ${res.status}`))
  if (!res.ok) throw new Error(`PageSpeed API zlyhalo (${res.status}).`)
  return json
}

export function buildReport(
  id: string,
  url: string,
  mobileJson: PsiResponse,
  desktopJson: PsiResponse,
  meta: {
    engine: Report["engine"]
    previousId?: string
    budget?: Partial<Budget>
    field?: FieldMetric[]
  } = {
    engine: "lighthouse",
  },
): Report {
  const mobile = parseStrategy(mobileJson)
  const desktop = parseStrategy(desktopJson)
  const field =
    meta.field ??
    (parseField(mobileJson).length ? parseField(mobileJson) : parseField(desktopJson))
  const finalUrl = mobileJson.lighthouseResult?.finalUrl ?? desktopJson.lighthouseResult?.finalUrl ?? url
  const budget = normalizeBudget(meta.budget ?? DEFAULT_BUDGET)
  return {
    id,
    url,
    finalUrl,
    createdAt: new Date().toISOString(),
    engine: meta.engine,
    previousId: meta.previousId,
    budget,
    budgetResult: {
      mobile: evaluateBudget(mobile, budget),
      desktop: evaluateBudget(desktop, budget),
    },
    mobile,
    desktop,
    field,
  }
}

export { shortUrl }
