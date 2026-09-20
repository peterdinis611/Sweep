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

export type CategoryScores = {
  performance: number
  accessibility: number | null
  bestPractices: number | null
  seo: number | null
}

export type Budget = {
  minScore: number
  maxLcpMs: number
  maxCls: number
  maxTbtMs: number
}

export type ProgressPhase = "verify" | "mobile" | "desktop" | "report" | "field" | "crawl"

export type BudgetFailure = {
  id: string
  label: string
  actual: string
  limit: string
}

export type BudgetCheck = {
  passed: boolean
  failures: BudgetFailure[]
}

export type StrategyReport = {
  score: number
  categories: CategoryScores
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
  budget: Budget
  budgetResult: { mobile: BudgetCheck; desktop: BudgetCheck }
  mobile: StrategyReport
  desktop: StrategyReport
  field: FieldMetric[]
}

export type CrawlItem = {
  url: string
  reportId?: string
  error?: string
  mobileScore?: number
  desktopScore?: number
  budgetPassed?: boolean
}

export type Crawl = {
  id: string
  sitemapUrl: string
  createdAt: string
  budget: Budget
  items: CrawlItem[]
}

export const DEFAULT_BUDGET: Budget = {
  minScore: 50,
  maxLcpMs: 2500,
  maxCls: 0.25,
  maxTbtMs: 600,
}
