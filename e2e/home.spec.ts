import { test, expect } from "@playwright/test"
import { HomePage } from "./pages"

test.describe("homepage", () => {
  test("renders brand, hero form and chrome", async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()

    await expect(home.brand).toHaveText("Sweep")
    await expect(home.urlInput).toBeVisible()
    await expect(home.analyzeButton).toBeEnabled()
    await expect(home.demoButton).toBeEnabled()
    await expect(home.demoPoorButton).toBeVisible()
    await expect(home.localeToggle).toBeVisible()
    await expect(home.themeToggle).toBeVisible()
  })

  test("shows validation error for empty URL", async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()

    await home.analyzeButton.click()
    await expect(home.formError).toBeVisible()
    await expect(home.formError).toContainText(/URL|adres/i)
  })

  test("shows validation error for invalid URL", async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()

    await home.analyze("not a url !!!")
    await expect(home.formError).toBeVisible()
  })
})
