import { defineConfig, devices } from "@playwright/test"

const PORT = Number(process.env.PW_PORT ?? 3000)
// Použi localhost (nie 127.0.0.1) — Next.js 16 blokuje cross-origin /_next z 127.0.0.1 pri hoste localhost.
const HOST = process.env.PW_HOST ?? "localhost"
const baseURL = `http://${HOST}:${PORT}`

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    locale: "sk-SK",
  },
  webServer: {
    command:
      process.env.PW_WEB_SERVER ??
      (process.env.CI ? `pnpm exec next start -p ${PORT}` : `pnpm exec next dev -p ${PORT}`),
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: "pipe",
    stderr: "pipe",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
    },
  ],
})
