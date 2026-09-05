import { existsSync } from "node:fs"
import lighthouse from "lighthouse"
import * as chromeLauncher from "chrome-launcher"
import type { PsiResponse } from "@/analysis/pagespeed"

const FLAGS = ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check"]

const CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  "/Applications/Arc.app/Contents/MacOS/Arc",
  "/Applications/Dia.app/Contents/MacOS/Dia",
  "/Applications/Vivaldi.app/Contents/MacOS/Vivaldi",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter((p): p is string => Boolean(p))

function resolveBrowser() {
  try {
    const found = chromeLauncher.Launcher.getInstallations()
    if (found[0]) return found[0]
  } catch {
    /* ignore */
  }
  return CANDIDATES.find((p) => existsSync(p))
}

const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"] as const

const desktopSettings = {
  extends: "lighthouse:default",
  settings: {
    formFactor: "desktop" as const,
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
    throttling: {
      rttMs: 40,
      throughputKbps: 10 * 1024,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0,
    },
    onlyCategories: [...CATEGORIES],
  },
}

function wrap(lhr: unknown): PsiResponse {
  return { lighthouseResult: lhr as PsiResponse["lighthouseResult"] }
}

export async function runLocalPair(
  url: string,
  signal?: AbortSignal,
): Promise<{ mobile: PsiResponse; desktop: PsiResponse }> {
  const chromePath = resolveBrowser()
  if (!chromePath) {
    throw new Error(
      "Nenašiel som prehliadač na meranie. Nainštaluj Chrome, Edge, Brave alebo Chromium — meranie beží lokálne, bez Google API.",
    )
  }

  let chrome: chromeLauncher.LaunchedChrome | undefined
  const onAbort = () => {
    void chrome?.kill()
  }
  signal?.addEventListener("abort", onAbort, { once: true })

  try {
    chrome = await chromeLauncher.launch({ chromePath, chromeFlags: FLAGS })
    if (signal?.aborted) throw new Error("Meranie bolo prerušené.")

    const flags = {
      port: chrome.port,
      output: "json" as const,
      logLevel: "error" as const,
      onlyCategories: [...CATEGORIES],
    }

    const mobileRes = await lighthouse(url, flags)
    if (!mobileRes?.lhr) throw new Error("Lighthouse nevrátil mobilný výsledok.")
    if (mobileRes.lhr.runtimeError?.message) {
      throw new Error(mapLocalError(mobileRes.lhr.runtimeError.message))
    }

    if (signal?.aborted) throw new Error("Meranie bolo prerušené.")

    const desktopRes = await lighthouse(url, flags, desktopSettings as never)
    if (!desktopRes?.lhr) throw new Error("Lighthouse nevrátil desktopový výsledok.")
    if (desktopRes.lhr.runtimeError?.message) {
      throw new Error(mapLocalError(desktopRes.lhr.runtimeError.message))
    }

    return { mobile: wrap(mobileRes.lhr), desktop: wrap(desktopRes.lhr) }
  } catch (e) {
    throw new Error(mapLocalError(e instanceof Error ? e.message : String(e)))
  } finally {
    signal?.removeEventListener("abort", onAbort)
    await chrome?.kill()
  }
}

function mapLocalError(message: string) {
  const m = message.toLowerCase()
  if (m.includes("no chrome installations") || m.includes("err_launcher_not_installed")) {
    return "Nenašiel som prehliadač na meranie. Nainštaluj Chrome, Edge, Brave alebo Chromium."
  }
  if (m.includes("failed_document_request") || m.includes("net::") || m.includes("dns")) {
    return "Stránka je nedostupná alebo odmietla meranie."
  }
  if (m.includes("timeout") || m.includes("timed out")) return "Lokálne meranie vypršalo. Skús to znova."
  if (m.includes("something went wrong") || m.includes("lighthouse returned error")) {
    return "Lighthouse meranie zlyhalo. Skontroluj URL a skús to znova."
  }
  return message.slice(0, 240)
}
