# Sweep

Web performance lab. By default it runs **local Lighthouse** in Chrome / Edge / Brave / Dia — no Google quota.

```bash
pnpm install
pnpm dev
```

Requires Google Chrome (or Chromium) on the machine. A full analysis takes about 20–60 s (mobile + desktop).

PageSpeed Insights API is only a fallback when Chrome is unavailable and `PAGESPEED_API_KEY` is set in `.env.local`. With the key present, Sweep can also enrich **CrUX field** metrics after a local lab run.

Reports live in `data/reports/` and are shareable at `/r/[id]`. Re-measuring the same URL shows an A/B diff. Old reports (and crawls) expire after `REPORT_TTL_DAYS` (default 14).

Demos on the homepage: **Demo** (mid score) and **Slow site**.

Features:
- **Budget** — min score, max LCP / CLS / TBT (PASS/FAIL on the report)
- **Sitemap crawl** — Sitemap mode on the homepage → `/c/[id]` (share + CSV)
- **Lighthouse categories** — Performance, Accessibility, Best Practices, SEO
- **Annotations** — mark opportunities as fixed (localStorage)
- **OG image** — `/r/[id]/opengraph-image` from the score
- **PDF** — real download (structured scores + opportunities)
- **Deep link** — `/r/[id]?s=desktop`
- **Live progress** — real lab phases; crawls show `URL 3/5`

## E2E (Playwright)

```bash
pnpm test:e2e        # Chromium (+ mobile) against next dev
pnpm test:e2e:ui     # interactive UI mode
```

In CI: `pnpm build`, then `CI=1 pnpm test:e2e` (uses `next start`).
