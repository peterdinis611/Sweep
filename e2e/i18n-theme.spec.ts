import { test, expect } from "@playwright/test"
import { HomePage, ReportPage } from "./pages"

test.describe("i18n and theme", () => {
  test("switches locale to English", async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()

    await home.setLocale("en")
    await expect(home.analyzeButton).toContainText("Analyze")
    await expect(home.demoButton).toContainText("Demo")
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Web speed/i)
  })

  test("toggles dark mode on html", async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()

    const before = await page.locator("html").evaluate((el) => el.classList.contains("dark"))
    await home.themeToggle.click()
    await expect
      .poll(async () => page.locator("html").evaluate((el) => el.classList.contains("dark")))
      .toBe(!before)
  })

  test("English locale persists into demo report copy", async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()
    await home.setLocale("en")
    await home.openDemo("mid")

    const report = new ReportPage(page)
    await report.expectLoaded()
    await expect(report.engine).toContainText("Demo report")
    await expect(page.getByTestId("fix-plan")).toContainText("Fix plan")
  })
})
