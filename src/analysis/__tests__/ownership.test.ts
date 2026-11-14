import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { OWNER_COOKIE_PREFIX, ownerCookieName, publicReport } from "../ownership"
import { DEMO_REPORT } from "../fixture"

describe("ownerCookieName", () => {
  it("prefixes report id", () => {
    assert.equal(ownerCookieName("abc-123"), `${OWNER_COOKIE_PREFIX}abc-123`)
  })
})

describe("publicReport", () => {
  it("strips ownerToken", () => {
    const withToken = { ...DEMO_REPORT, ownerToken: "secret-token" }
    const pub = publicReport(withToken)
    assert.equal("ownerToken" in pub, false)
    assert.equal(pub.id, DEMO_REPORT.id)
    assert.equal(pub.url, DEMO_REPORT.url)
  })
})
