import { test, expect } from "@playwright/test"

test.describe("health + security headers", () => {
  test("GET /api/health returns service status", async ({ request }) => {
    const res = await request.get("/api/health")
    expect(res.ok()).toBeTruthy()
    expect(res.headers()["cache-control"] ?? "").toMatch(/no-store/i)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.service).toBe("sweep")
    expect(typeof body.chrome).toBe("boolean")
    expect(body.queue).toBeTruthy()
    expect(typeof body.queue.depth).toBe("number")
    expect(typeof body.queue.limit).toBe("number")
  })

  test("homepage sends security headers", async ({ request }) => {
    const res = await request.get("/")
    expect(res.ok()).toBeTruthy()
    const headers = res.headers()
    expect(headers["x-content-type-options"]).toBe("nosniff")
    expect(headers["x-frame-options"]).toBe("DENY")
    expect(headers["referrer-policy"]).toMatch(/strict-origin/i)
    expect(headers["x-powered-by"]).toBeFalsy()
  })

  test("invalid report id rewrites to branded 400", async ({ request }) => {
    const res = await request.get("/r/bad!")
    expect(res.status()).toBe(400)
  })
})
