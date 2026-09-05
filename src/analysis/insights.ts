import type { Impact, Metric, Opportunity, Rating, Strength } from "@/analysis/types"

const SKIP_AUDIT_IDS = new Set([
  "metrics",
  "diagnostics",
  "network-requests",
  "network-rtt",
  "network-server-latency",
  "mainthread-work-breakdown",
  "script-treemap-data",
  "resource-summary",
  "screenshot-thumbnails",
  "final-screenshot",
  "full-page-screenshot",
  "largest-contentful-paint-element",
  "lcp-lazy-loaded",
  "layout-shifts",
  "long-tasks",
  "non-composited-animations",
  "unsized-images",
  "viewport",
  "first-contentful-paint",
  "largest-contentful-paint",
  "cumulative-layout-shift",
  "total-blocking-time",
  "speed-index",
  "interactive",
  "max-potential-fid",
  "server-response-time",
  "time-to-first-byte",
])

const PASSED_TITLES: Record<string, string> = {
  "uses-text-compression": "Textová kompresia je zapnutá",
  "uses-long-cache-ttl": "Cache prehliadača je nastavená",
  redirects: "Bez zbytočných presmerovaní",
  "uses-http2": "HTTP/2 (alebo novší) je aktívny",
  "unminified-css": "CSS je minifikované",
  "unminified-javascript": "JavaScript je minifikovaný",
  "uses-optimized-images": "Obrázky sú dobre komprimované",
  "modern-image-formats": "Moderné formáty obrázkov",
  "offscreen-images": "Odložené obrázky mimo obrazovky",
  "render-blocking-resources": "Bez ťažkého blokovania renderu",
  "unused-css-rules": "CSS bez veľkého mŕtveho kódu",
  "unused-javascript": "JS bez veľkého mŕtveho kódu",
  "uses-responsive-images": "Responzívne obrázky",
  "font-display": "Font-display je nastavený",
  "uses-rel-preconnect": "Preconnect na kľúčové origin",
  "preload-lcp-image": "LCP obrázok je prioritizovaný",
  "prioritize-lcp-image": "LCP obrázok je prioritizovaný",
  "efficient-animated-content": "Animovaný obsah je efektívny",
  "duplicated-javascript": "Bez duplicitného JavaScriptu",
  "legacy-javascript": "Bez zbytočného legacy JavaScriptu",
  "total-byte-weight": "Celková váha stránky je v norme",
  "bootup-time": "Krátky čas spustenia JS",
  "dom-size": "DOM nie je príliš veľký",
  "third-party-summary": "Tretie strany sú pod kontrolou",
}

const METRIC_IMPROVE: Record<string, { title: string; poor: string; ni: string }> = {
  lcp: {
    title: "Skráť Largest Contentful Paint",
    poor: "Hlavný obsah sa zobrazuje pomaly. Skontroluj LCP element (obrázok/hero), prednačítanie a odozvu servera.",
    ni: "LCP je tesne nad cieľom. Pomôže optimalizácia LCP obrázka, fontov a TTFB.",
  },
  tbt: {
    title: "Zníž Total Blocking Time",
    poor: "Hlavné vlákno je dlho blokované. Rozdeľ ťažký JavaScript a odlož nepotrebné skripty.",
    ni: "Interaktivita je na hranici. Skráť dlhé úlohy na hlavnom vlákne.",
  },
  cls: {
    title: "Stabilizuj layout (CLS)",
    poor: "Obsah poskakuje pri načítaní. Rezervuj rozmery obrázkov/reklám a vyhni sa vkladaniu nad obsah.",
    ni: "Layout sa ešte mierne posúva. Skontroluj fonty a dynamické bannery.",
  },
  fcp: {
    title: "Skráť First Contentful Paint",
    poor: "Prvý obsah prichádza neskoro. Zníž blokujúce CSS/JS a skráť TTFB.",
    ni: "FCP je nad ideálom. Pomôže critical CSS a rýchlejší server.",
  },
  ttfb: {
    title: "Skráť Time to First Byte",
    poor: "Server odpovedá pomaly. Skontroluj hosting, cache a edge CDN.",
    ni: "TTFB je vyššie než cieľ. Pomôže cache HTML alebo bližší edge.",
  },
  si: {
    title: "Zlepši Speed Index",
    poor: "Obsah sa vykresľuje neskoro. Zníž nad-the-fold JS/CSS a veľké médiá.",
    ni: "Speed Index je priemerný. Prioritizuj viditeľný obsah.",
  },
  inp: {
    title: "Zlepši Interaction to Next Paint",
    poor: "Odozva na interakcie je pomalá. Skráť handlery a ťažký JS po načítaní.",
    ni: "INP je na hranici. Optimalizuj event handlery a third-party skripty.",
  },
}

const METRIC_GOOD: Record<string, { title: string; body: string }> = {
  lcp: {
    title: "LCP je v zelenej zóne",
    body: "Hlavný obsah sa zobrazí dostatočne rýchlo pre dobrý prvý dojem.",
  },
  tbt: {
    title: "Hlavné vlákno nie je preťažené",
    body: "Total Blocking Time je v norme — stránka ostáva prijateľne interaktívna.",
  },
  cls: {
    title: "Layout je stabilný",
    body: "Cumulative Layout Shift je nízky — obsah pri načítaní neposkakuje.",
  },
  fcp: {
    title: "Rýchly First Contentful Paint",
    body: "Používateľ rýchlo vidí prvý obsah — dobrý signál vnímanej rýchlosti.",
  },
  ttfb: {
    title: "Server odpovedá rýchlo",
    body: "Time to First Byte je v zelenej zóne.",
  },
  si: {
    title: "Dobré vykresľovanie obsahu",
    body: "Speed Index ukazuje plynulé napĺňanie obrazovky.",
  },
  inp: {
    title: "Dobrá odozva na interakcie",
    body: "Interaction to Next Paint je v cieli — kliky a ťuknutia pôsobia živo.",
  },
}

type AuditLike = {
  id?: string
  title?: string
  description?: string
  score?: number | null
  displayValue?: string
  scoreDisplayMode?: string
  details?: { type?: string; overallSavingsMs?: number; items?: unknown[] }
}

function stripHtml(s: string) {
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
}

function impactFrom(ms: number): Impact {
  if (ms >= 500) return "high"
  if (ms >= 120) return "medium"
  return "low"
}

function ratingImpact(rating: Rating): Impact {
  return rating === "poor" ? "high" : "medium"
}

export function buildImprovements(
  audits: Record<string, AuditLike>,
  metrics: { id: string; metric: Metric }[],
): Opportunity[] {
  const fromAudits: Opportunity[] = Object.values(audits)
    .filter((a) => a.details?.type === "opportunity" && (a.details.overallSavingsMs ?? 0) > 20)
    .map((a) => {
      const savingsMs = Math.round(a.details?.overallSavingsMs ?? 0)
      return {
        id: a.id ?? "audit",
        title: stripHtml(a.title ?? "Optimalizácia"),
        description: stripHtml(a.description ?? ""),
        displayValue: a.displayValue,
        savingsMs,
        impact: impactFrom(savingsMs),
        scoreHint: Math.min(18, Math.max(1, Math.round(savingsMs / 80))),
      }
    })

  // Prefer Slovak titles from LABELS map when available — patched in caller via title override.
  const fromMetrics: Opportunity[] = metrics.flatMap((m) => {
    if (m.metric.rating !== "poor" && m.metric.rating !== "ni") return []
    if (fromAudits.some((o) => o.id.includes(m.id) || o.title.toLowerCase().includes(m.id))) return []
    const tip = METRIC_IMPROVE[m.id]
    if (!tip) return []
    return [
      {
        id: `metric-${m.id}`,
        title: tip.title,
        description: m.metric.rating === "poor" ? tip.poor : tip.ni,
        displayValue: m.metric.display,
        savingsMs: m.metric.rating === "poor" ? 400 : 150,
        impact: ratingImpact(m.metric.rating),
        scoreHint: m.metric.rating === "poor" ? 6 : 3,
      },
    ]
  })

  return [...fromAudits, ...fromMetrics]
    .sort((a, b) => b.savingsMs - a.savingsMs || (a.impact === "high" ? -1 : 1))
    .slice(0, 14)
}

export function buildStrengths(
  audits: Record<string, AuditLike>,
  metrics: { id: string; metric: Metric }[],
  score: number,
): Strength[] {
  const fromMetrics: Strength[] = metrics.flatMap((m) => {
    if (m.metric.rating !== "good") return []
    const tip = METRIC_GOOD[m.id]
    if (!tip) return []
    return [
      {
        id: `good-${m.id}`,
        title: tip.title,
        description: tip.body,
        displayValue: m.metric.display,
      },
    ]
  })

  const fromAudits: Strength[] = Object.values(audits)
    .filter((a) => a.score === 1)
    .filter((a) => a.id && !SKIP_AUDIT_IDS.has(a.id))
    .filter((a) => {
      const mode = a.scoreDisplayMode ?? ""
      return mode === "binary" || mode === "metricSavings" || mode === "numeric" || mode === ""
    })
    .filter((a) => Boolean(PASSED_TITLES[a.id!] || a.title))
    .map((a) => ({
      id: `pass-${a.id}`,
      title: PASSED_TITLES[a.id!] ?? stripHtml(a.title ?? "Audit v poriadku"),
      description: stripHtml(a.description ?? "Tento Lighthouse audit prešiel bez výhrad."),
      displayValue: a.displayValue,
    }))
    .slice(0, 10)

  const scoreStrength: Strength[] =
    score >= 90
      ? [
          {
            id: "good-score",
            title: "Vynikajúce laboratórne skóre",
            description: "Celkové performance skóre je 90+, čo signalizuje veľmi dobrú rýchlosť.",
            displayValue: `${score} / 100`,
          },
        ]
      : score >= 70
        ? [
            {
              id: "good-score",
              title: "Solidné laboratórne skóre",
              description: "Skóre je nad priemerom — základy sú dobré, priestor na dolaďovanie ostáva v detailoch.",
              displayValue: `${score} / 100`,
            },
          ]
        : []

  // Prefer metric strengths, then score, then unique audits
  const seen = new Set<string>()
  const out: Strength[] = []
  for (const s of [...scoreStrength, ...fromMetrics, ...fromAudits]) {
    const key = s.title.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(s)
    if (out.length >= 10) break
  }
  return out
}

/** Apply Slovak opportunity titles from a label map. */
export function localizeOpportunityTitles(
  items: Opportunity[],
  labels: Record<string, string>,
): Opportunity[] {
  return items.map((o) => ({
    ...o,
    title: labels[o.id] ?? o.title,
  }))
}
