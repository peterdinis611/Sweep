import assert from "node:assert/strict"
import { afterEach, describe, it } from "node:test"
import { assertPublicUrl, isBlockedIp, privateUrlsAllowed } from "@/analysis/ssrf"

const prevPrivate = process.env.SWEEP_ALLOW_PRIVATE_URLS

afterEach(() => {
  if (prevPrivate === undefined) delete process.env.SWEEP_ALLOW_PRIVATE_URLS
  else process.env.SWEEP_ALLOW_PRIVATE_URLS = prevPrivate
})

describe("isBlockedIp", () => {
  it("blocks private and loopback IPv4", () => {
    assert.equal(isBlockedIp("127.0.0.1"), true)
    assert.equal(isBlockedIp("10.0.0.5"), true)
    assert.equal(isBlockedIp("192.168.1.1"), true)
    assert.equal(isBlockedIp("172.16.0.1"), true)
    assert.equal(isBlockedIp("169.254.169.254"), true)
  })

  it("allows public IPv4", () => {
    assert.equal(isBlockedIp("8.8.8.8"), false)
    assert.equal(isBlockedIp("1.1.1.1"), false)
  })
})

describe("assertPublicUrl", () => {
  it("skips checks when private URLs are allowed", async () => {
    process.env.SWEEP_ALLOW_PRIVATE_URLS = "1"
    assert.equal(privateUrlsAllowed(), true)
    await assertPublicUrl("http://127.0.0.1/")
  })

  it("rejects localhost when private URLs are disabled", async () => {
    process.env.SWEEP_ALLOW_PRIVATE_URLS = "0"
    assert.equal(privateUrlsAllowed(), false)
    await assert.rejects(() => assertPublicUrl("http://localhost:3000/"), /Private or local/)
    await assert.rejects(() => assertPublicUrl("http://127.0.0.1/"), /Private or local/)
  })

  it("rejects credentials when private URLs are disabled", async () => {
    process.env.SWEEP_ALLOW_PRIVATE_URLS = "0"
    await assert.rejects(() => assertPublicUrl("https://user:pass@example.com/"), /credentials/)
  })
})
