# Sweep

Web performance lab. By default it runs **local Lighthouse** in Chrome / Edge / Brave / Dia — no Google quota.

```bash
pnpm install
pnpm dev
```

Requires Google Chrome (or Chromium) on the machine. A full analysis takes about 20–60 s (mobile + desktop).

PageSpeed Insights API is only a fallback when Chrome is unavailable and `PAGESPEED_API_KEY` is set in `.env.local`. With the key present, Sweep can also enrich **CrUX field** metrics after a local lab run.

Reports live in `data/reports/` and are shareable at `/r/[id]`. Re-measuring the same URL shows an A/B diff. Old reports (and crawls) expire after `REPORT_TTL_DAYS` (default 14).

Public SEO: `/sitemap.xml`, `/robots.txt`, OG image, JSON-LD. Private routes (`/r/*`, `/c/*`, `/api/*`) are noindex. Invalid report/crawl ids return a branded **400**; missing labs return **404**; render failures use **500**.

Demos on the homepage: **Demo** (mid score) and **Slow site**.

Features:
- **Budget** — min score, max LCP / CLS / TBT; optional `.sweepbudget.json` (see `.sweepbudget.json.example`)
- **Throttling** — mobile default / Slow 4G / cable / unthrottled
- **N-run median** — 1–5 mobile runs with variance on the report
- **Staging headers** — Cookie / Authorization for local auth pages
- **Raw LHR** — download full Lighthouse JSON from the report toolbar
- **Recent labs** — homepage list of reports/crawls with TTL
- **Sitemap crawl** — `/c/[id]` with share, CSV, and opportunity matrix
- **LCP / critical path** — LCP element + main requests
- **Annotations** — fixed marks keyed by host (survive re-measure)
- **CLI gate** — `pnpm sweep -- https://example.com` (exit 0/1/2)
- **PDF / CSV / OG / deep link** — `/r/[id]?s=desktop`

## E2E (Playwright)

```bash
pnpm test:e2e        # Chromium (+ mobile) against next dev
pnpm test:e2e:ui     # interactive UI mode
```

In CI: `pnpm build`, then `CI=1 pnpm test:e2e` (uses `next start`).
