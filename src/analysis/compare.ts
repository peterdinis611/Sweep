import type { Metric, StrategyReport } from "@/analysis/types"

export type DeltaRow = {
  key: string
  label: string
  current: string
  previous: string
  /** Kladné = zlepšenie (po normalizácii smeru). */
  delta: number
  /** true = vyššia hodnota je lepšia (skóre). */
  higherIsBetter: boolean
}

function metricDelta(label: string, key: string, cur: Metric, prev: Metric, higherIsBetter = false): DeltaRow {
  const delta = higherIsBetter ? cur.numeric - prev.numeric : prev.numeric - cur.numeric
  return {
    key,
    label,
    current: cur.display,
    previous: prev.display,
    delta,
    higherIsBetter,
  }
}

export function buildStrategyDelta(current: StrategyReport, previous: StrategyReport): DeltaRow[] {
  return [
    {
      key: "score",
      label: "Skóre",
      current: String(current.score),
      previous: String(previous.score),
      delta: current.score - previous.score,
      higherIsBetter: true,
    },
    metricDelta("LCP", "lcp", current.lcp, previous.lcp),
    metricDelta("TBT", "tbt", current.tbt, previous.tbt),
    metricDelta("CLS", "cls", current.cls, previous.cls),
    metricDelta("FCP", "fcp", current.fcp, previous.fcp),
    metricDelta("TTFB", "ttfb", current.ttfb, previous.ttfb),
    {
      key: "bytes",
      label: "Prenos",
      current: String(current.bytes),
      previous: String(previous.bytes),
      delta: previous.bytes - current.bytes,
      higherIsBetter: false,
    },
  ]
}

export function formatDelta(row: DeltaRow) {
  if (row.key === "score") {
    const n = row.delta
    if (n === 0) return "±0"
    return n > 0 ? `+${n}` : String(n)
  }
  if (row.key === "cls") {
    const n = Number(row.current) - Number(row.previous)
    if (Math.abs(n) < 0.001) return "±0"
    const improved = n < 0
    const abs = Math.abs(n).toFixed(3)
    return improved ? `−${abs}` : `+${abs}`
  }
  if (row.key === "bytes") {
    const n = row.delta
    if (n === 0) return "±0"
    const kb = Math.round(Math.abs(n) / 1000)
    return n > 0 ? `−${kb} kB` : `+${kb} kB`
  }
  const n = row.delta
  if (Math.abs(n) < 1) return "±0"
  return n > 0 ? `−${Math.round(Math.abs(n))} ms` : `+${Math.round(Math.abs(n))} ms`
}

export function deltaTone(row: DeltaRow): "good" | "bad" | "flat" {
  if (Math.abs(row.delta) < 0.5 && row.key !== "cls") return "flat"
  if (row.key === "cls") {
    const n = Number(row.current) - Number(row.previous)
    if (Math.abs(n) < 0.001) return "flat"
    return n < 0 ? "good" : "bad"
  }
  return row.delta > 0 ? "good" : row.delta < 0 ? "bad" : "flat"
}
