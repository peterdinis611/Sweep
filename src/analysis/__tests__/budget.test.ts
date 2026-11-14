import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { evaluateBudget, normalizeBudget } from "../budget"
import type { StrategyReport } from "../types"

function stubStrategy(partial: Partial<StrategyReport> & { score: number }): StrategyReport {
  const metric = (numeric: number, display: string) => ({
    id: "m",
    label: "m",
    display,
    numeric,
    rating: "good" as const,
    unit: "ms" as const,
  })
  const { score, lcp, tbt, cls, ...rest } = partial
  return {
    score,
    categories: { performance: score, accessibility: null, bestPractices: null, seo: null },
    lcp: lcp ?? metric(2000, "2 s"),
    inp: null,
    tbt: tbt ?? metric(200, "200 ms"),
    cls: cls ?? { id: "cls", label: "CLS", display: "0.05", numeric: 0.05, rating: "good", unit: "score" },
    fcp: metric(1000, "1 s"),
    ttfb: metric(200, "200 ms"),
    speedIndex: metric(2000, "2 s"),
    bytes: 100_000,
    requests: 20,
    opportunities: [],
    strengths: [],
    waterfall: [],
    filmstrip: [],
    ...rest,
  }
}

describe("normalizeBudget", () => {
  it("applies defaults and clamps", () => {
    const b = normalizeBudget({ minScore: 150, maxLcpMs: 50 })
    assert.equal(b.minScore, 100)
    assert.equal(b.maxLcpMs, 100)
    assert.equal(b.maxCls, 0.25)
  })
})

describe("evaluateBudget", () => {
  it("passes when within limits", () => {
    const check = evaluateBudget(
      stubStrategy({ score: 70 }),
      normalizeBudget({ minScore: 50, maxLcpMs: 2500, maxCls: 0.25, maxTbtMs: 600 }),
    )
    assert.equal(check.passed, true)
    assert.equal(check.failures.length, 0)
  })

  it("fails on score and LCP", () => {
    const check = evaluateBudget(
      stubStrategy({
        score: 40,
        lcp: { id: "lcp", label: "LCP", display: "3 s", numeric: 3000, rating: "ni", unit: "ms" },
      }),
      normalizeBudget({ minScore: 50, maxLcpMs: 2500 }),
    )
    assert.equal(check.passed, false)
    assert.deepEqual(
      check.failures.map((f) => f.id),
      ["score", "lcp"],
    )
  })

  it("fails on CLS and TBT", () => {
    const check = evaluateBudget(
      stubStrategy({
        score: 90,
        cls: { id: "cls", label: "CLS", display: "0.4", numeric: 0.4, rating: "poor", unit: "score" },
        tbt: { id: "tbt", label: "TBT", display: "900 ms", numeric: 900, rating: "poor", unit: "ms" },
      }),
      normalizeBudget({ maxCls: 0.1, maxTbtMs: 300 }),
    )
    assert.equal(check.passed, false)
    assert.deepEqual(
      check.failures.map((f) => f.id).sort(),
      ["cls", "tbt"],
    )
  })
})
