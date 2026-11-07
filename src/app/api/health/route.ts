import { existsSync } from "node:fs"
import { NextResponse } from "next/server"
import { queueDepth, queueLimit } from "@/analysis/queue"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function chromeAvailable() {
  const path = process.env.CHROME_PATH?.trim()
  if (path && existsSync(path)) return true
  const candidates = [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ]
  return candidates.some((p) => existsSync(p))
}

export async function GET() {
  const chrome = chromeAvailable()
  const body = {
    ok: true,
    service: "sweep",
    time: new Date().toISOString(),
    chrome,
    psiConfigured: Boolean(process.env.PAGESPEED_API_KEY?.trim()),
    queue: { depth: queueDepth(), limit: queueLimit() },
    ttlDays: Number(process.env.REPORT_TTL_DAYS ?? 14),
  }
  return NextResponse.json(body, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  })
}
