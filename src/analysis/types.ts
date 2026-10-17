export type Rating = "good" | "ni" | "poor"
export type Strategy = "mobile" | "desktop"
export type Impact = "high" | "medium" | "low"
export type AnalysisEngine = "lighthouse" | "psi" | "demo"
export type ThrottlePreset = "mobileDefault" | "slow4g" | "cable" | "unthrottled"

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

export type CriticalRequest = {
  url: string
  transferSize: number
  start: number
  duration: number
  type: string
}

export type CriticalPath = {
  lcpElement?: string
  lcpUrl?: string
  lcpType?: string
  requests: CriticalRequest[]
}

export type RunSample = {
  score: number
  lcpMs: number
  cls: number
  tbtMs: number
}

export type RunStats = {
  runs: number
  scores: number[]
  lcpMs: number[]
  medianScore: number
  medianLcpMs: number
  scoreSpread: number
  lcpSpreadMs: number
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
  criticalPath?: CriticalPath
  runStats?: RunStats
}

export type LabHeaders = {
  cookie?: string
  authorization?: string
  extra?: Record<string, string>
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
  throttle?: ThrottlePreset
  runs?: number
  hasRawLhr?: boolean
}

export type CrawlItem = {
  url: string
  reportId?: string
  error?: string
  mobileScore?: number
  desktopScore?: number
  budgetPassed?: boolean
  opportunityIds?: string[]
}

export type OpportunityMatrixRow = {
  id: string
  title: string
  count: number
  urls: string[]
}

export type Crawl = {
  id: string
  sitemapUrl: string
  createdAt: string
  budget: Budget
  items: CrawlItem[]
  opportunityMatrix?: OpportunityMatrixRow[]
}

export type LabListItem = {
  kind: "report" | "crawl"
  id: string
  host: string
  url: string
  createdAt: string
  score?: number
  passed?: boolean
  expiresInDays: number
  href: string
}

export const DEFAULT_BUDGET: Budget = {
  minScore: 50,
  maxLcpMs: 2500,
  maxCls: 0.25,
  maxTbtMs: 600,
}

export const THROTTLE_PRESETS: ThrottlePreset[] = ["mobileDefault", "slow4g", "cable", "unthrottled"]
