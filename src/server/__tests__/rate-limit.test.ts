import assert from "node:assert/strict"
import { afterEach, describe, it } from "node:test"
import { clientKey, rateLimit, RateLimitError, resetRateLimit } from "@/server/rate-limit"

afterEach(() => {
  resetRateLimit()
})

describe("clientKey", () => {
  it("uses IP and suffix", () => {
    assert.equal(clientKey("1.2.3.4", "analyze"), "1.2.3.4:analyze")
  })

  it("falls back to unknown", () => {
    assert.equal(clientKey(null, "crawl"), "unknown:crawl")
    assert.equal(clientKey("  ", "demo"), "unknown:demo")
  })
})

describe("rateLimit (TanStack Pacer)", () => {
  it("allows up to the limit then throws", () => {
    const key = `test-${Date.now()}-${Math.random()}`
    rateLimit(key, 3, 60_000)
    rateLimit(key, 3, 60_000)
    rateLimit(key, 3, 60_000)
    assert.throws(() => rateLimit(key, 3, 60_000), RateLimitError)
  })

  it("includes retry hint in the error message", () => {
    const key = `test-msg-${Date.now()}-${Math.random()}`
    rateLimit(key, 1, 60_000)
    assert.throws(
      () => rateLimit(key, 1, 60_000),
      (err: unknown) =>
        err instanceof RateLimitError && /Try again in \d+s/.test(err.message),
    )
  })

  it("treats invalid limits as default 8", () => {
    const key = `test-default-${Date.now()}-${Math.random()}`
    for (let i = 0; i < 8; i++) rateLimit(key, Number.NaN, 60_000)
    assert.throws(() => rateLimit(key, Number.NaN, 60_000), RateLimitError)
  })

  it("resetRateLimit clears capacity for a key", () => {
    const key = `test-reset-${Date.now()}-${Math.random()}`
    rateLimit(key, 1, 60_000)
    assert.throws(() => rateLimit(key, 1, 60_000), RateLimitError)
    resetRateLimit(key)
    assert.doesNotThrow(() => rateLimit(key, 1, 60_000))
  })
})
