import { test, expect } from "@playwright/test"
import { HomePage, ReportPage } from "./pages"

test.describe("budget, categories, deep link", () => {
  test("demo report shows budget banner and categories", async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()
    await home.openDemo("mid")

    const report = new ReportPage(page)
    await report.expectLoaded()
    await expect(page.getByTestId("budget-banner")).toBeVisible()
    await expect(page.getByTestId("categories-section")).toBeVisible()
    await expect(page.getByTestId("categories-section")).toContainText("Accessibility")
  })

  test("deep link opens desktop strategy", async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()
    await home.openDemo("mid")
    const base = page.url().split("?")[0]
    await page.goto(`${base}?s=desktop`)
    await expect(page.getByTestId("report-view")).toBeVisible()
    await expect.poll(async () => Number(await page.getByTestId("score-gauge").getAttribute("data-score"))).toBeGreaterThanOrEqual(80)
  })

  test("PDF download button exists", async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()
    await home.openDemo("mid")
    await expect(page.getByTestId("export-pdf")).toBeVisible()
  })

  test("home exposes sitemap mode and budget fields", async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()
    await expect(page.getByTestId("mode-sitemap")).toBeVisible()
    await page.getByTestId("mode-sitemap").click()
    await expect(page.getByTestId("crawl-limit")).toBeVisible()
    await expect(page.getByTestId("budget-min-score")).toHaveValue("50")
  })
})
