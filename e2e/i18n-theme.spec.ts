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

  test("light mode keeps readable footer controls", async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()

    await page.evaluate(() => {
      document.documentElement.classList.remove("dark")
      document.documentElement.style.colorScheme = "light"
      localStorage.setItem("sweep-theme", "light")
    })
    await page.reload()
    await home.goto()

    await expect(page.locator("html")).not.toHaveClass(/dark/)
    const scheme = await page.locator("html").evaluate((el) => getComputedStyle(el).colorScheme)
    expect(scheme).toMatch(/light/i)

    const demo = home.demoButton
    await expect(demo).toBeVisible()
    const styles = await demo.evaluate((el) => {
      const s = getComputedStyle(el)
      return { color: s.color, bg: s.backgroundColor }
    })
    expect(styles.bg).toMatch(/rgba\(0,\s*0,\s*0,\s*0\)|transparent/i)
    // muted text should not be near-white in light mode
    expect(styles.color).not.toMatch(/rgb\(\s*25[0-5]/)
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
