import type { Report, StrategyReport } from "@/analysis/types"
import { DEFAULT_BUDGET } from "@/analysis/types"
import { evaluateBudget, normalizeBudget } from "@/analysis/budget"

function svgFrame(label: string, bg: string, accent = "#0a2458") {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="135" height="240" viewBox="0 0 135 240"><rect width="135" height="240" fill="${bg}"/><rect x="10" y="16" width="115" height="14" rx="2" fill="${accent}" opacity=".35"/><rect x="10" y="40" width="80" height="8" rx="2" fill="#000" opacity=".12"/><rect x="10" y="56" width="115" height="70" rx="3" fill="${accent}" opacity=".18"/><rect x="10" y="140" width="115" height="8" rx="2" fill="#000" opacity=".1"/><rect x="10" y="156" width="90" height="8" rx="2" fill="#000" opacity=".08"/><text x="67" y="220" text-anchor="middle" fill="#666" font-size="11" font-family="ui-monospace,monospace">${label}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function filmstrip(timings: number[], bgs: string[]) {
  return timings.map((timing, i) => ({
    timing,
    data: svgFrame(`${(timing / 1000).toFixed(1)}s`, bgs[i] ?? "#f4f1ea"),
  }))
}

function strat(
  score: number,
  categories: StrategyReport["categories"],
  extra: Partial<StrategyReport> &
    Pick<
      StrategyReport,
      | "lcp"
      | "tbt"
      | "cls"
      | "fcp"
      | "ttfb"
      | "speedIndex"
      | "bytes"
      | "requests"
      | "opportunities"
      | "strengths"
      | "waterfall"
      | "filmstrip"
    >,
): StrategyReport {
  return {
    score,
    categories,
    inp: {
      id: "inp",
      label: "INP",
      display: "168 ms",
      numeric: 168,
      rating: "good",
      unit: "ms",
    },
    screenshot: svgFrame("final", "#e8e4da", "#0a2458"),
    ...extra,
  }
}


function withBudget(report: Omit<Report, "budgetResult"> & { budgetResult?: Report["budgetResult"] }): Report {
  const budget = normalizeBudget(report.budget ?? DEFAULT_BUDGET)
  return {
    ...report,
    budget,
    budgetResult: {
      mobile: evaluateBudget(report.mobile, budget),
      desktop: evaluateBudget(report.desktop, budget),
    },
  }
}

const MID_WATERFALL = [
  { url: "https://shop.example/sk/", start: 0, duration: 420, transferSize: 48200, status: 200, type: "Document" },
  { url: "https://shop.example/assets/app.css", start: 180, duration: 260, transferSize: 96400, status: 200, type: "Stylesheet" },
  { url: "https://shop.example/assets/vendor.js", start: 220, duration: 890, transferSize: 412000, status: 200, type: "Script" },
  { url: "https://shop.example/assets/app.js", start: 310, duration: 640, transferSize: 188000, status: 200, type: "Script" },
  { url: "https://cdn.example/hero.webp", start: 480, duration: 720, transferSize: 286000, status: 200, type: "Image" },
  { url: "https://fonts.gstatic.com/s/plex.woff2", start: 520, duration: 180, transferSize: 42000, status: 200, type: "Font" },
  { url: "https://shop.example/api/cart", start: 1100, duration: 340, transferSize: 2100, status: 200, type: "Fetch" },
  { url: "https://www.googletagmanager.com/gtm.js", start: 1250, duration: 410, transferSize: 98000, status: 200, type: "Script" },
]

const POOR_WATERFALL = [
  { url: "https://slow.example/", start: 0, duration: 980, transferSize: 112000, status: 200, type: "Document" },
  { url: "https://slow.example/css/all.css", start: 400, duration: 820, transferSize: 340000, status: 200, type: "Stylesheet" },
  { url: "https://slow.example/js/bundle.js", start: 520, duration: 2100, transferSize: 980000, status: 200, type: "Script" },
  { url: "https://slow.example/js/ads.js", start: 600, duration: 1600, transferSize: 420000, status: 200, type: "Script" },
  { url: "https://img.slow.example/hero.jpg", start: 900, duration: 2400, transferSize: 1800000, status: 200, type: "Image" },
  { url: "https://img.slow.example/a.jpg", start: 1400, duration: 900, transferSize: 640000, status: 200, type: "Image" },
  { url: "https://img.slow.example/b.jpg", start: 1500, duration: 1100, transferSize: 720000, status: 200, type: "Image" },
  { url: "https://cdn.third/track.js", start: 1800, duration: 1300, transferSize: 210000, status: 200, type: "Script" },
  { url: "https://slow.example/api/feed", start: 2200, duration: 1600, transferSize: 88000, status: 200, type: "Fetch" },
]

/** Realistická stredná ukážka (~68 mobil). */
export const DEMO_REPORT: Report = withBudget({
  id: "demo-mid",
  url: "https://shop.example/sk/",
  finalUrl: "https://shop.example/sk/",
  createdAt: new Date().toISOString(),
  engine: "demo",
  budget: DEFAULT_BUDGET,
  field: [
    { id: "lcp", label: "LCP (pole)", display: "2.84 s", percentile: 2840, category: "ni" },
    { id: "inp", label: "INP (pole)", display: "148 ms", percentile: 148, category: "good" },
    { id: "cls", label: "CLS (pole)", display: "0.08", percentile: 0.08, category: "good" },
  ],
  mobile: strat(68, { performance: 68, accessibility: 92, bestPractices: 88, seo: 100 }, {
    lcp: { id: "lcp", label: "LCP", display: "3.12 s", numeric: 3120, rating: "ni", unit: "ms" },
    tbt: { id: "tbt", label: "TBT", display: "280 ms", numeric: 280, rating: "ni", unit: "ms" },
    cls: { id: "cls", label: "CLS", display: "0.06", numeric: 0.06, rating: "good", unit: "score" },
    fcp: { id: "fcp", label: "FCP", display: "1.94 s", numeric: 1940, rating: "ni", unit: "ms" },
    ttfb: { id: "ttfb", label: "TTFB", display: "620 ms", numeric: 620, rating: "good", unit: "ms" },
    speedIndex: { id: "si", label: "Speed Index", display: "3.40 s", numeric: 3400, rating: "ni", unit: "ms" },
    bytes: 1_124_000,
    requests: 48,
    opportunities: [
      {
        id: "render-blocking-resources",
        title: "Odstráň blokujúce CSS/JS",
        description: "Vendor CSS a GTM blokujú first paint. Odlož nepotrebné skripty a inline critical CSS.",
        displayValue: "Úspora 780 ms",
        savingsMs: 780,
        impact: "high",
        scoreHint: 8,
      },
      {
        id: "unused-javascript",
        title: "Zníž nepoužitý JavaScript",
        description: "Vendor bundle obsahuje kód, ktorý sa na homepage nevykoná. Code-split a tree-shake.",
        displayValue: "Úspora 420 ms",
        savingsMs: 420,
        impact: "high",
        scoreHint: 5,
      },
      {
        id: "uses-responsive-images",
        title: "Servíruj správnu veľkosť obrázkov",
        description: "Hero sa sťahuje väčší než viewport mobilu. srcset + moderný formát skráti LCP.",
        displayValue: "Úspora 310 ms",
        savingsMs: 310,
        impact: "medium",
        scoreHint: 3,
      },
      {
        id: "uses-text-compression",
        title: "Zapni textovú kompresiu (Brotli)",
        description: "Textové zdroje ešte nie sú plne komprimované.",
        displayValue: "Úspora 120 ms",
        savingsMs: 120,
        impact: "low",
        scoreHint: 1,
      },
    ],
    strengths: [
      {
        id: "good-cls",
        title: "Layout je stabilný",
        description: "CLS je v zelenej zóne — obsah pri načítaní neposkakuje.",
        displayValue: "0.06",
      },
      {
        id: "good-ttfb",
        title: "Server odpovedá rýchlo",
        description: "TTFB pod 800 ms je dobrý základ pre FCP aj LCP.",
        displayValue: "620 ms",
      },
      {
        id: "pass-http2",
        title: "HTTP/2 je aktívny",
        description: "Multiplexované requesty šetria latenciu na mobilnej sieti.",
      },
    ],
    waterfall: MID_WATERFALL,
    filmstrip: filmstrip(
      [0, 800, 1600, 2400, 3200],
      ["#f7f4ec", "#efeae0", "#e6e0d4", "#ddd6c8", "#d4ccbc"],
    ),
  }),
  desktop: strat(84, { performance: 84, accessibility: 95, bestPractices: 92, seo: 100 }, {
    lcp: { id: "lcp", label: "LCP", display: "1.68 s", numeric: 1680, rating: "good", unit: "ms" },
    tbt: { id: "tbt", label: "TBT", display: "90 ms", numeric: 90, rating: "good", unit: "ms" },
    cls: { id: "cls", label: "CLS", display: "0.04", numeric: 0.04, rating: "good", unit: "score" },
    fcp: { id: "fcp", label: "FCP", display: "0.92 s", numeric: 920, rating: "good", unit: "ms" },
    ttfb: { id: "ttfb", label: "TTFB", display: "280 ms", numeric: 280, rating: "good", unit: "ms" },
    speedIndex: { id: "si", label: "Speed Index", display: "1.55 s", numeric: 1550, rating: "good", unit: "ms" },
    bytes: 1_240_000,
    requests: 52,
    opportunities: [
      {
        id: "unused-javascript",
        title: "Zníž nepoužitý JavaScript",
        description: "Aj na desktope ostáva veľký vendor bundle.",
        displayValue: "Úspora 180 ms",
        savingsMs: 180,
        impact: "medium",
        scoreHint: 2,
      },
      {
        id: "uses-long-cache-ttl",
        title: "Zapni cache prehliadača",
        description: "Statické assety bez dlhej TTL sa sťahujú znova.",
        displayValue: "Úspora 90 ms",
        savingsMs: 90,
        impact: "low",
        scoreHint: 1,
      },
    ],
    strengths: [
      {
        id: "good-score",
        title: "Silné desktopové skóre",
        description: "Laboratórne skóre 84 signalizuje dobrú rýchlosť na širokom viewporte.",
        displayValue: "84 / 100",
      },
      {
        id: "good-lcp",
        title: "LCP je v zelenej zóne",
        description: "Hlavný obsah sa zobrazí dostatočne rýchlo.",
        displayValue: "1.68 s",
      },
    ],
    waterfall: MID_WATERFALL.map((w) => ({ ...w, duration: Math.round(w.duration * 0.55) })),
    filmstrip: filmstrip(
      [0, 400, 900, 1400, 1800],
      ["#f7f4ec", "#f0ebe1", "#e8e2d6", "#e0d9cb", "#d8d0c2"],
    ),
  }),
})

/** Ukážka ťažkého webu — veľké obrázky, JS, CLS. */
export const DEMO_REPORT_POOR: Report = withBudget({
  id: "demo-poor",
  url: "https://slow.example/",
  finalUrl: "https://slow.example/",
  createdAt: new Date().toISOString(),
  engine: "demo",
  budget: DEFAULT_BUDGET,
  field: [
    { id: "lcp", label: "LCP (pole)", display: "5.40 s", percentile: 5400, category: "poor" },
    { id: "inp", label: "INP (pole)", display: "320 ms", percentile: 320, category: "ni" },
    { id: "cls", label: "CLS (pole)", display: "0.28", percentile: 0.28, category: "poor" },
  ],
  mobile: strat(32, { performance: 32, accessibility: 71, bestPractices: 58, seo: 82 }, {
    lcp: { id: "lcp", label: "LCP", display: "6.20 s", numeric: 6200, rating: "poor", unit: "ms" },
    tbt: { id: "tbt", label: "TBT", display: "980 ms", numeric: 980, rating: "poor", unit: "ms" },
    cls: { id: "cls", label: "CLS", display: "0.31", numeric: 0.31, rating: "poor", unit: "score" },
    fcp: { id: "fcp", label: "FCP", display: "3.80 s", numeric: 3800, rating: "poor", unit: "ms" },
    ttfb: { id: "ttfb", label: "TTFB", display: "1.40 s", numeric: 1400, rating: "ni", unit: "ms" },
    speedIndex: { id: "si", label: "Speed Index", display: "7.10 s", numeric: 7100, rating: "poor", unit: "ms" },
    bytes: 4_860_000,
    requests: 96,
    opportunities: [
      {
        id: "uses-optimized-images",
        title: "Komprimuj a zmenši obrázky",
        description: "Hero JPEG má ~1,8 MB. WebP/AVIF + správne rozmery dramaticky skráti LCP.",
        displayValue: "Úspora 2.4 s",
        savingsMs: 2400,
        impact: "high",
        scoreHint: 18,
      },
      {
        id: "bootup-time",
        title: "Skráť čas spustenia JavaScriptu",
        description: "Hlavné vlákno je dlho blokované ads a vendor bundle-om.",
        displayValue: "Úspora 1.1 s",
        savingsMs: 1100,
        impact: "high",
        scoreHint: 12,
      },
      {
        id: "metric-cls",
        title: "Stabilizuj layout (CLS)",
        description: "Bannery a obrázky bez rozmerov posúvajú obsah pri načítaní.",
        displayValue: "0.31",
        savingsMs: 900,
        impact: "high",
        scoreHint: 8,
      },
      {
        id: "render-blocking-resources",
        title: "Odstráň blokujúce CSS",
        description: "Jediný veľký all.css blokuje first paint.",
        displayValue: "Úspora 640 ms",
        savingsMs: 640,
        impact: "medium",
        scoreHint: 5,
      },
    ],
    strengths: [
      {
        id: "pass-https",
        title: "HTTPS je v poriadku",
        description: "Certifikát a protokol nie sú problémom — bottleneck je váha stránky.",
      },
    ],
    waterfall: POOR_WATERFALL,
    filmstrip: filmstrip(
      [0, 1500, 3000, 4500, 6000],
      ["#f0ebe3", "#e4ddd2", "#d8d0c2", "#ccc3b2", "#c0b6a4"],
    ),
  }),
  desktop: strat(51, { performance: 51, accessibility: 74, bestPractices: 62, seo: 85 }, {
    lcp: { id: "lcp", label: "LCP", display: "3.40 s", numeric: 3400, rating: "ni", unit: "ms" },
    tbt: { id: "tbt", label: "TBT", display: "420 ms", numeric: 420, rating: "ni", unit: "ms" },
    cls: { id: "cls", label: "CLS", display: "0.22", numeric: 0.22, rating: "ni", unit: "score" },
    fcp: { id: "fcp", label: "FCP", display: "1.90 s", numeric: 1900, rating: "ni", unit: "ms" },
    ttfb: { id: "ttfb", label: "TTFB", display: "780 ms", numeric: 780, rating: "good", unit: "ms" },
    speedIndex: { id: "si", label: "Speed Index", display: "4.20 s", numeric: 4200, rating: "ni", unit: "ms" },
    bytes: 5_100_000,
    requests: 102,
    opportunities: [
      {
        id: "uses-optimized-images",
        title: "Komprimuj a zmenši obrázky",
        description: "Aj na desktope hero a galéria zbytočne ťahajú megabajty.",
        displayValue: "Úspora 1.2 s",
        savingsMs: 1200,
        impact: "high",
        scoreHint: 10,
      },
      {
        id: "third-party-summary",
        title: "Obmedz tretie strany",
        description: "Tracking a ads skripty výrazne predlžujú TBT.",
        displayValue: "Úspora 480 ms",
        savingsMs: 480,
        impact: "medium",
        scoreHint: 4,
      },
    ],
    strengths: [
      {
        id: "good-ttfb",
        title: "TTFB je prijateľné",
        description: "Server nie je hlavný problém — váha frontendu áno.",
        displayValue: "780 ms",
      },
    ],
    waterfall: POOR_WATERFALL.map((w) => ({ ...w, duration: Math.round(w.duration * 0.65) })),
    filmstrip: filmstrip(
      [0, 900, 1800, 2700, 3600],
      ["#f0ebe3", "#e6dfd4", "#dcd4c6", "#d2c9b8", "#c8beaa"],
    ),
  }),
})
