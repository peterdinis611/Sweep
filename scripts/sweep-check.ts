#!/usr/bin/env node
/**
 * Sweep CLI gate — exit 0 on budget PASS, 1 on FAIL, 2 on error.
 *
 *   pnpm sweep -- https://example.com
 *   pnpm sweep -- https://example.com --runs 3 --throttle slow4g
 */
import { pathToFileURL } from "node:url"
import path from "node:path"

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== "--")
  if (args.includes("-h") || args.includes("--help") || args.length === 0) {
    console.log(`Usage: pnpm sweep -- <url> [--runs 1-5] [--throttle mobileDefault|slow4g|cable|unthrottled]

Reads .sweepbudget.json when present. Exit codes: 0 PASS, 1 FAIL, 2 error.`)
    process.exit(args.length === 0 ? 2 : 0)
  }

  const url = args.find((a) => !a.startsWith("--"))
  if (!url) {
    console.error("Missing URL")
    process.exit(2)
  }

  const runsIdx = args.indexOf("--runs")
  const runs = runsIdx >= 0 ? Number(args[runsIdx + 1] ?? 1) : 1
  const throttleIdx = args.indexOf("--throttle")
  const throttle = (throttleIdx >= 0 ? args[throttleIdx + 1] : "mobileDefault") as
    | "mobileDefault"
    | "slow4g"
    | "cable"
    | "unthrottled"

  // Dynamic import from compiled-ish TS via tsx
  const { normalizeUrl } = await import("../src/analysis/pagespeed")
  const { runAnalysis } = await import("../src/analysis/run")
  const { evaluateBudget } = await import("../src/analysis/budget")

  const normalized = normalizeUrl(url)
  console.log(`Sweep check · ${normalized}`)
  console.log(`runs=${runs} throttle=${throttle}`)

  try {
    const report = await runAnalysis(normalized, undefined, undefined, {
      runs: Number.isFinite(runs) ? runs : 1,
      throttle,
      saveRawLhr: true,
    })
    const mobile = evaluateBudget(report.mobile, report.budget)
    const desktop = evaluateBudget(report.desktop, report.budget)
    const passed = mobile.passed && desktop.passed
    console.log(`Report: /r/${report.id}`)
    console.log(`Mobile ${report.mobile.score} · Desktop ${report.desktop.score}`)
    console.log(`Budget: ${passed ? "PASS" : "FAIL"}`)
    if (!passed) {
      for (const f of [...mobile.failures, ...desktop.failures]) {
        console.log(`  ✗ ${f.label}: ${f.actual} (${f.limit})`)
      }
    }
    process.exit(passed ? 0 : 1)
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    process.exit(2)
  }
}

main()
