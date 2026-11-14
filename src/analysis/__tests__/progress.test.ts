import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { clearJobProgress, getJobProgress, setJobProgress } from "../progress"

describe("job progress", () => {
  it("ignores empty job ids", () => {
    setJobProgress(undefined, { phase: "verify", pct: 10 })
    assert.equal(getJobProgress("missing"), null)
  })

  it("stores and clears progress", () => {
    const id = `job-${Date.now()}`
    setJobProgress(id, { phase: "mobile", pct: 40, url: "https://example.com" })
    const first = getJobProgress(id)
    assert.ok(first)
    assert.equal(first.phase, "mobile")
    assert.equal(first.pct, 40)
    assert.equal(first.url, "https://example.com")

    setJobProgress(id, { phase: "desktop", pct: 80 })
    const second = getJobProgress(id)!
    assert.equal(second.phase, "desktop")
    assert.equal(second.pct, 80)
    assert.equal(second.url, "https://example.com")

    clearJobProgress(id)
    assert.equal(getJobProgress(id), null)
  })
})
