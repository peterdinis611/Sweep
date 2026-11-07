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
- **Compare any two** — `/r/[id]?vs=[otherId]` + pin baseline (localStorage)
- **Cancel lab** — abort in-progress job; queue capped by `SWEEP_MAX_QUEUE` (default 8)
- **Delete own report** — owner cookie set on create; delete from report masthead
- **LHR TTL** — raw Lighthouse JSON cleaned with expired reports

## Tests & CI

```bash
pnpm typecheck
pnpm test            # unit tests in src/analysis/__tests__
pnpm test:e2e        # Playwright
pnpm test:e2e:ui
```

CI runs typecheck + unit tests, then build + Playwright.

## Production

Copy `.env.example` → `.env` (or set env in your host) and set at least:

| Variable | Notes |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public origin, e.g. `https://sweep.example.com` |
| `PAGESPEED_API_KEY` | Optional; Chrome is preferred for lab runs |
| `REPORT_TTL_DAYS` | On-disk report / crawl / LHR cleanup |
| `SWEEP_MAX_QUEUE` | Cap on concurrent lab jobs (default 8) |
| `SWEEP_RATE_LIMIT` / `SWEEP_RATE_WINDOW_MS` | Per-IP write limit for analyze/crawl |
| `SWEEP_ALLOW_PRIVATE_URLS` | `1` only if you must measure localhost (off in prod by default) |
| `SWEEP_ALLOW_DEMO` | Homepage demos (off in prod by default) |
| `CHROME_PATH` | Absolute path to Chromium when auto-detect fails |

```bash
pnpm build
pnpm start            # NODE_ENV=production; listens on PORT (default 3000)
```

Health check: `GET /api/health` (Chrome presence, PSI key, queue depth).

### Docker

Image includes system Chromium. Persist `data/` so reports survive restarts:

```bash
docker compose up --build -d
# or
docker build -t sweep --build-arg NEXT_PUBLIC_SITE_URL=https://sweep.example.com .
docker run --rm -p 3000:3000 -v sweep-data:/app/data \
  -e NEXT_PUBLIC_SITE_URL=https://sweep.example.com \
  sweep
```

### Security defaults

- **SSRF guard** — blocks localhost, private/link-local IPs, and cloud metadata hosts (DNS-resolved).
- **Rate limit** — process-local sliding window on analyze / crawl / demo writes.
- **Demos off** in production unless `SWEEP_ALLOW_DEMO=1`.
- Reports/crawls under `/r/*` and `/c/*` are noindex; security headers via `next.config.ts`.

Single-process storage under `data/` — for multi-instance deploy, put a shared volume (or move storage) behind the app; the in-memory queue and rate limiter are per process.
