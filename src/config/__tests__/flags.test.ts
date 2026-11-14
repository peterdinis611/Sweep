import assert from "node:assert/strict"
import { afterEach, describe, it } from "node:test"
import { demosEnabled } from "@/config/flags"

const prev = process.env.SWEEP_ALLOW_DEMO

afterEach(() => {
  if (prev === undefined) delete process.env.SWEEP_ALLOW_DEMO
  else process.env.SWEEP_ALLOW_DEMO = prev
})

describe("demosEnabled", () => {
  it("respects explicit true/false", () => {
    process.env.SWEEP_ALLOW_DEMO = "1"
    assert.equal(demosEnabled(), true)
    process.env.SWEEP_ALLOW_DEMO = "true"
    assert.equal(demosEnabled(), true)
    process.env.SWEEP_ALLOW_DEMO = "0"
    assert.equal(demosEnabled(), false)
    process.env.SWEEP_ALLOW_DEMO = "false"
    assert.equal(demosEnabled(), false)
  })

  it("defaults from NODE_ENV when unset", () => {
    delete process.env.SWEEP_ALLOW_DEMO
    const expected = process.env.NODE_ENV !== "production"
    assert.equal(demosEnabled(), expected)
  })
})
