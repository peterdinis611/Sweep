import { test, expect } from "@playwright/test"
import { HomePage, ReportPage } from "./pages"

test.describe("navigation and faults", () => {
  test("missing report shows fault screen", async ({ page }) => {
    await page.goto("/r/missing-report-id-xyz", { waitUntil: "domcontentloaded" })
    // RSC 404 shell hydratuje klientský not-found
    await expect(page.getByTestId("fault-screen")).toBeVisible({ timeout: 20_000 })
    await expect(page.getByTestId("fault-screen")).toHaveAttribute("data-code", "404")
    await expect(page.getByTestId("fault-home-link")).toBeVisible()
  })

  test("new scan from report returns home", async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()
    await home.openDemo("mid")

    const report = new ReportPage(page)
    await report.expectLoaded()
    await report.newScan.click()
    await page.waitForURL("/")
    await expect(page.getByTestId("measure-form")).toBeVisible()
    await expect(page.getByTestId("brand")).toBeVisible()
  })

  test("global not-found page responds", async ({ page }) => {
    const res = await page.goto("/definitely-missing-route-xyz")
    expect(res?.status()).toBe(404)
  })
})
