import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { formatBytes, formatMs, humanPsiError, normalizeUrl, scoreTone } from "../pagespeed"

describe("normalizeUrl", () => {
  it("adds https when protocol is missing", () => {
    assert.equal(normalizeUrl("example.com"), "https://example.com/")
  })

  it("keeps http(s)", () => {
    assert.equal(normalizeUrl("http://example.com/path"), "http://example.com/path")
    assert.equal(normalizeUrl("https://example.com/path"), "https://example.com/path")
  })

  it("rejects empty and invalid values", () => {
    assert.throws(() => normalizeUrl(""), /Enter a URL/)
    assert.throws(() => normalizeUrl("   "), /Enter a URL/)
    assert.throws(() => normalizeUrl("http://"), /Invalid URL/)
  })
})

describe("scoreTone", () => {
  it("maps score bands", () => {
    assert.equal(scoreTone(90), "good")
    assert.equal(scoreTone(89), "ni")
    assert.equal(scoreTone(50), "ni")
    assert.equal(scoreTone(49), "poor")
  })
})

describe("formatMs / formatBytes", () => {
  it("formats milliseconds", () => {
    assert.equal(formatMs(850), "850 ms")
    assert.equal(formatMs(1500), "1.50 s")
    assert.equal(formatMs(12_000), "12.0 s")
  })

  it("formats bytes", () => {
    assert.equal(formatBytes(500), "500 B")
    assert.equal(formatBytes(12_500), "13 kB")
    assert.equal(formatBytes(2_500_000), "2.50 MB")
  })
})

describe("humanPsiError", () => {
  it("maps known PSI failures", () => {
    assert.match(humanPsiError("FAILED_DOCUMENT_REQUEST dns"), /unreachable/i)
    assert.match(humanPsiError("InvalidArgument: invalid url"), /Invalid URL/)
    assert.match(humanPsiError("deadline timed out"), /timed out/i)
    assert.match(humanPsiError("RESOURCE_EXHAUSTED quota"), /quota/i)
    assert.match(humanPsiError("Something went wrong"), /Lighthouse/i)
  })

  it("truncates unknown messages", () => {
    const long = "x".repeat(400)
    assert.equal(humanPsiError(long).length, 220)
  })
})
