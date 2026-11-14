import assert from "node:assert/strict"
import { afterEach, describe, it } from "node:test"
import { expiresInDays, reportTtlDays } from "../store"

const prev = process.env.REPORT_TTL_DAYS

afterEach(() => {
  if (prev === undefined) delete process.env.REPORT_TTL_DAYS
  else process.env.REPORT_TTL_DAYS = prev
})

describe("reportTtlDays", () => {
  it("uses env when valid", () => {
    process.env.REPORT_TTL_DAYS = "21"
    assert.equal(reportTtlDays(), 21)
  })

  it("falls back to 14 for invalid values", () => {
    process.env.REPORT_TTL_DAYS = "0"
    assert.equal(reportTtlDays(), 14)
    process.env.REPORT_TTL_DAYS = "nope"
    assert.equal(reportTtlDays(), 14)
  })
})

describe("expiresInDays", () => {
  it("returns remaining days from createdAt", () => {
    process.env.REPORT_TTL_DAYS = "10"
    const createdAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    const left = expiresInDays(createdAt)
    assert.ok(left >= 7 && left <= 9)
  })

  it("never goes negative", () => {
    process.env.REPORT_TTL_DAYS = "1"
    const createdAt = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
    assert.equal(expiresInDays(createdAt), 0)
  })
})
