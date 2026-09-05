import { formatMs } from "@/analysis/pagespeed"
import type { Budget, BudgetCheck, StrategyReport } from "@/analysis/types"
import { DEFAULT_BUDGET } from "@/analysis/types"

export function normalizeBudget(input?: Partial<Budget> | null): Budget {
  const minScore = clamp(Math.round(input?.minScore ?? DEFAULT_BUDGET.minScore), 0, 100)
  const maxLcpMs = clamp(Math.round(input?.maxLcpMs ?? DEFAULT_BUDGET.maxLcpMs), 100, 20_000)
  return { minScore, maxLcpMs }
}

export function evaluateBudget(data: StrategyReport, budget: Budget): BudgetCheck {
  const failures: BudgetCheck["failures"] = []
  if (data.score < budget.minScore) {
    failures.push({
      id: "score",
      label: "Performance skóre",
      actual: String(data.score),
      limit: `≥ ${budget.minScore}`,
    })
  }
  if (data.lcp.numeric > budget.maxLcpMs) {
    failures.push({
      id: "lcp",
      label: "LCP",
      actual: formatMs(data.lcp.numeric),
      limit: `≤ ${formatMs(budget.maxLcpMs)}`,
    })
  }
  return { passed: failures.length === 0, failures }
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number.isFinite(n) ? n : min))
}
