import { test, expect } from "@playwright/test"
import { HomePage, ReportPage } from "./pages"

test.describe("demo reports", () => {
  test("mid demo opens a full report", async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()
    await home.openDemo("mid")

    const report = new ReportPage(page)
    await report.expectLoaded()

    await expect(report.engine).toContainText(/Ukážkový|Ukázkový|Demo/i)
    await expect(report.host).toContainText("shop.example")
    expect(Number(await report.score())).toBeGreaterThanOrEqual(60)
    expect(Number(await report.score())).toBeLessThan(90)

    await expect(report.fixPlan).toBeVisible()
    await expect(page.getByTestId("fix-step-1")).toBeVisible()
    await expect(page.getByTestId("fix-step-2")).toBeVisible()
    await expect(page.getByTestId("fix-step-3")).toBeVisible()
    await expect(report.filmstrip).toBeVisible()
    await expect(report.field).toBeVisible()
    await expect(report.waterfall).toBeVisible()
  })

  test("poor demo shows a weak score and fix plan", async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()
    await home.openDemo("poor")

    const report = new ReportPage(page)
    await report.expectLoaded()

    await expect(report.host).toContainText("slow.example")
    expect(Number(await report.score())).toBeLessThan(50)
    await expect(report.fixPlan).toBeVisible()
    await expect(report.filmstrip).toBeVisible()
  })

  test("desktop tab switches strategy score", async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()
    await home.openDemo("mid")

    const report = new ReportPage(page)
    await report.expectLoaded()

    const mobileScore = Number(await report.score())
    await report.tabDesktop.click()
    await expect.poll(async () => Number(await report.score())).not.toBe(mobileScore)
    expect(Number(await report.score())).toBeGreaterThan(mobileScore)
  })

  test("share copies report link", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])

    const home = new HomePage(page)
    await home.goto()
    await home.openDemo("mid")

    const report = new ReportPage(page)
    await report.expectLoaded()
    await report.shareLink.click()

    await expect(report.shareLink).toContainText(/Skopírované|Zkopírováno|Copied/i)
    const text = await page.evaluate(() => navigator.clipboard.readText())
    expect(text).toMatch(/\/r\/demo-mid-/i)
  })
})
