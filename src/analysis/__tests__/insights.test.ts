import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { buildImprovements, buildStrengths, localizeOpportunityTitles } from "../insights"
import type { Metric } from "../types"

const metric = (id: string, rating: Metric["rating"], display = "3 s"): Metric => ({
  id,
  label: id.toUpperCase(),
  display,
  numeric: rating === "poor" ? 4000 : rating === "ni" ? 2500 : 1200,
  rating,
  unit: "ms",
})

describe("buildImprovements", () => {
  it("includes opportunity audits sorted by savings", () => {
    const ops = buildImprovements(
      {
        a: {
          id: "unused-javascript",
          title: "Remove unused JS",
          description: "Save bytes",
          details: { type: "opportunity", overallSavingsMs: 800 },
        },
        b: {
          id: "render-blocking-resources",
          title: "Eliminate render-blocking",
          description: "CSS",
          details: { type: "opportunity", overallSavingsMs: 1200 },
        },
        skip: {
          id: "tiny",
          title: "Tiny",
          details: { type: "opportunity", overallSavingsMs: 5 },
        },
      },
      [],
    )
    assert.equal(ops[0]?.id, "render-blocking-resources")
    assert.equal(ops.length, 2)
    assert.equal(ops[0]?.impact, "high")
  })

  it("adds metric tips for poor vitals", () => {
    const ops = buildImprovements({}, [{ id: "lcp", metric: metric("lcp", "poor") }])
    assert.ok(ops.some((o) => o.id === "metric-lcp"))
  })
})

describe("buildStrengths", () => {
  it("surfaces good metrics and audits", () => {
    const strengths = buildStrengths(
      {
        "uses-text-compression": {
          id: "uses-text-compression",
          title: "Text compression",
          score: 1,
          scoreDisplayMode: "binary",
        },
      },
      [{ id: "cls", metric: metric("cls", "good", "0.02") }],
      92,
    )
    assert.ok(strengths.length >= 1)
  })
})

describe("localizeOpportunityTitles", () => {
  it("replaces known audit ids from label map", () => {
    const rows = localizeOpportunityTitles(
      [
        {
          id: "unused-javascript",
          title: "Reduce unused JavaScript",
          description: "",
          savingsMs: 100,
          impact: "medium",
          scoreHint: 2,
        },
      ],
      { "unused-javascript": "Odstráň nepoužívaný JavaScript" },
    )
    assert.equal(rows[0]!.title, "Odstráň nepoužívaný JavaScript")
  })
})
