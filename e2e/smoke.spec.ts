import { test, expect } from "@playwright/test"

test.describe("static endpoints", () => {
  test("robots.txt allows crawling and points to sitemap", async ({ request }) => {
    const res = await request.get("/robots.txt")
    expect(res.ok()).toBeTruthy()
    const body = await res.text()
    expect(body).toMatch(/User-agent/i)
    expect(body).toMatch(/sitemap\.xml/i)
  })

  test("sitemap.xml is served", async ({ request }) => {
    const res = await request.get("/sitemap.xml")
    expect(res.ok()).toBeTruthy()
    const body = await res.text()
    expect(body).toMatch(/<urlset|<sitemapindex/i)
  })

  test("manifest is served", async ({ request }) => {
    const res = await request.get("/manifest.webmanifest")
    expect(res.ok()).toBeTruthy()
    const json = await res.json()
    expect(json.name || json.short_name).toBeTruthy()
  })
})
