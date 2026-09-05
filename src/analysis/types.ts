export type Rating = "good" | "ni" | "poor"
export type Strategy = "mobile" | "desktop"
export type Impact = "high" | "medium" | "low"
export type AnalysisEngine = "lighthouse" | "psi" | "demo"

export type Metric = {
  id: string
  label: string
  display: string
  numeric: number
  rating: Rating
  unit: "ms" | "s" | "score"
}

export type Opportunity = {
  id: string
  title: string
  description: string
  displayValue?: string
  savingsMs: number
  impact: Impact
  scoreHint: number
}

export type Strength = {
  id: string
  title: string
  description: string
  displayValue?: string
}

export type WaterfallItem = {
  url: string
  start: number
  duration: number
  transferSize: number
  status: number
  type: string
}

export type FieldMetric = {
  id: string
  label: string
  display: string
  percentile: number
  category: Rating
}

export type FilmstripFrame = {
  timing: number
  data: string
}

export type StrategyReport = {
  score: number
  lcp: Metric
  inp: Metric | null
  tbt: Metric
  cls: Metric
  fcp: Metric
  ttfb: Metric
  speedIndex: Metric
  bytes: number
  requests: number
  opportunities: Opportunity[]
  strengths: Strength[]
  waterfall: WaterfallItem[]
  screenshot?: string
  filmstrip: FilmstripFrame[]
}

export type Report = {
  id: string
  url: string
  finalUrl: string
  createdAt: string
  engine: AnalysisEngine
  /** Predchádzajúci report pre tú istú URL (A/B diff). */
  previousId?: string
  mobile: StrategyReport
  desktop: StrategyReport
  field: FieldMetric[]
}
