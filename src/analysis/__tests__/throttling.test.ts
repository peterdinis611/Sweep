import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { desktopThrottlingFor, throttlingFor } from "../throttling"

describe("throttlingFor", () => {
  it("returns slow4g profile", () => {
    const t = throttlingFor("slow4g")
    assert.equal(t.rttMs, 150)
    assert.equal(t.cpuSlowdownMultiplier, 4)
    assert.ok(t.throughputKbps > 0)
  })

  it("returns unthrottled zeros", () => {
    const t = throttlingFor("unthrottled")
    assert.equal(t.rttMs, 0)
    assert.equal(t.throughputKbps, 0)
    assert.equal(t.cpuSlowdownMultiplier, 1)
  })

  it("cable is faster than mobileDefault", () => {
    const cable = throttlingFor("cable")
    const mobile = throttlingFor("mobileDefault")
    assert.ok(cable.throughputKbps > mobile.throughputKbps)
    assert.ok(cable.cpuSlowdownMultiplier < mobile.cpuSlowdownMultiplier)
  })
})

describe("desktopThrottlingFor", () => {
  it("uses lighter CPU slowdown for slow4g on desktop", () => {
    assert.equal(desktopThrottlingFor("slow4g").cpuSlowdownMultiplier, 2)
    assert.equal(throttlingFor("slow4g").cpuSlowdownMultiplier, 4)
  })

  it("keeps cable / mobileDefault desktop defaults", () => {
    const t = desktopThrottlingFor("cable")
    assert.equal(t.rttMs, 40)
    assert.equal(t.cpuSlowdownMultiplier, 1)
  })
})
