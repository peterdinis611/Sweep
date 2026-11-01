import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { buildStrategyDelta, deltaTone, formatDelta } from "../compare"
import type { StrategyReport } from "../types"

function stub(score: number, lcpMs: number, bytes: number): StrategyReport {
  const m = (numeric: number, display: string) => ({
    id: "m",
    label: "m",
    display,
    numeric,
    rating: "good" as const,
    unit: "ms" as const,
  })
  return {
    score,
    categories: { performance: score, accessibility: null, bestPractices: null, seo: null },
    lcp: m(lcpMs, `${lcpMs} ms`),
    inp: null,
    tbt: m(100, "100 ms"),
    cls: { id: "cls", label: "CLS", display: "0.1", numeric: 0.1, rating: "ni", unit: "score" },
    fcp: m(800, "800 ms"),
    ttfb: m(200, "200 ms"),
    speedIndex: m(1500, "1.5 s"),
    bytes,
    requests: 10,
    opportunities: [],
    strengths: [],
    waterfall: [],
    filmstrip: [],
  }
}

describe("buildStrategyDelta", () => {
  it("marks higher score as improvement", () => {
    const rows = buildStrategyDelta(stub(80, 2000, 100_000), stub(60, 3000, 200_000))
    const score = rows.find((r) => r.key === "score")!
    assert.equal(score.delta, 20)
    assert.equal(deltaTone(score), "good")
    assert.equal(formatDelta(score), "+20")
  })

  it("treats lower LCP as improvement", () => {
    const rows = buildStrategyDelta(stub(80, 1500, 100_000), stub(80, 3000, 100_000))
    const lcp = rows.find((r) => r.key === "lcp")!
    assert.ok(lcp.delta > 0)
    assert.equal(deltaTone(lcp), "good")
  })
})
