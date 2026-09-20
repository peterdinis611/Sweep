import { formatMs } from "@/analysis/pagespeed"
import type { Budget, BudgetCheck, StrategyReport } from "@/analysis/types"
import { DEFAULT_BUDGET } from "@/analysis/types"

export function normalizeBudget(input?: Partial<Budget> | null): Budget {
  const minScore = clamp(Math.round(input?.minScore ?? DEFAULT_BUDGET.minScore), 0, 100)
  const maxLcpMs = clamp(Math.round(input?.maxLcpMs ?? DEFAULT_BUDGET.maxLcpMs), 100, 20_000)
  const maxCls = clamp(Number(input?.maxCls ?? DEFAULT_BUDGET.maxCls), 0, 2)
  const maxTbtMs = clamp(Math.round(input?.maxTbtMs ?? DEFAULT_BUDGET.maxTbtMs), 50, 20_000)
  return { minScore, maxLcpMs, maxCls, maxTbtMs }
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
  if (data.cls.numeric > budget.maxCls) {
    failures.push({
      id: "cls",
      label: "CLS",
      actual: data.cls.display,
      limit: `≤ ${budget.maxCls.toFixed(3)}`,
    })
  }
  if (data.tbt.numeric > budget.maxTbtMs) {
    failures.push({
      id: "tbt",
      label: "TBT",
      actual: formatMs(data.tbt.numeric),
      limit: `≤ ${formatMs(budget.maxTbtMs)}`,
    })
  }
  return { passed: failures.length === 0, failures }
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number.isFinite(n) ? n : min))
}
