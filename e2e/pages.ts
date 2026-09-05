import { expect, type Locator, type Page } from "@playwright/test"

export class HomePage {
  readonly page: Page
  readonly brand: Locator
  readonly form: Locator
  readonly urlInput: Locator
  readonly analyzeButton: Locator
  readonly demoButton: Locator
  readonly demoPoorButton: Locator
  readonly formError: Locator
  readonly localeToggle: Locator
  readonly themeToggle: Locator

  constructor(page: Page) {
    this.page = page
    this.brand = page.getByTestId("brand")
    this.form = page.getByTestId("measure-form")
    this.urlInput = page.getByTestId("url-input")
    this.analyzeButton = page.getByTestId("analyze-button")
    this.demoButton = page.getByTestId("demo-button")
    this.demoPoorButton = page.getByTestId("demo-poor-button")
    this.formError = page.getByTestId("form-error")
    this.localeToggle = page.getByTestId("locale-toggle")
    this.themeToggle = page.getByTestId("theme-toggle")
  }

  async goto() {
    await this.page.goto("/")
    await expect(this.brand).toBeVisible()
    await expect(this.form).toBeVisible()
  }

  async openDemo(variant: "mid" | "poor" = "mid") {
    if (variant === "poor") {
      await this.demoPoorButton.click()
    } else {
      await this.demoButton.click()
    }
    await this.page.waitForURL(/\/r\/[a-z0-9-]+/i, { timeout: 45_000 })
    await expect(this.page.getByTestId("report-view")).toBeVisible({ timeout: 15_000 })
  }

  async analyze(url: string) {
    await this.urlInput.fill(url)
    await this.analyzeButton.click()
  }

  async setLocale(code: "sk" | "cs" | "en") {
    await this.page.getByTestId(`locale-${code}`).click()
  }
}

export class ReportPage {
  readonly page: Page
  readonly root: Locator
  readonly host: Locator
  readonly engine: Locator
  readonly scoreGauge: Locator
  readonly fixPlan: Locator
  readonly filmstrip: Locator
  readonly field: Locator
  readonly waterfall: Locator
  readonly tabMobile: Locator
  readonly tabDesktop: Locator
  readonly shareLink: Locator
  readonly newScan: Locator

  constructor(page: Page) {
    this.page = page
    this.root = page.getByTestId("report-view")
    this.host = page.getByTestId("report-host")
    this.engine = page.getByTestId("report-engine")
    this.scoreGauge = page.getByTestId("score-gauge")
    this.fixPlan = page.getByTestId("fix-plan")
    this.filmstrip = page.getByTestId("filmstrip")
    this.field = page.getByTestId("field-section")
    this.waterfall = page.getByTestId("waterfall-section")
    this.tabMobile = page.getByTestId("tab-mobile")
    this.tabDesktop = page.getByTestId("tab-desktop")
    this.shareLink = page.getByTestId("share-link")
    this.newScan = page.getByTestId("report-new-scan")
  }

  async expectLoaded() {
    await expect(this.root).toBeVisible()
    await expect(this.scoreGauge).toBeVisible()
    await expect(this.host).toBeVisible()
  }

  score(): Promise<string | null> {
    return this.scoreGauge.getAttribute("data-score")
  }
}
