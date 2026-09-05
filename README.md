# Sweep

Meranie rýchlosti webu. Predvolene beží **lokálne Lighthouse** v Chrome / Edge / Brave / Dia — bez Google kvóty.

```bash
pnpm install
pnpm dev
```

Potrebuje Google Chrome (alebo Chromium) na počítači. Analýza trvá cca 20–60 s (mobil + desktop).

PageSpeed Insights API je len záloha, ak Chrome nie je k dispozícii a v `.env.local` je `PAGESPEED_API_KEY`.

Reporty sú v `data/reports/` a dajú sa zdieľať cez `/r/[id]`. Po opätovnom meraní rovnakej URL uvidíš A/B diff. Staré reporty sa mažú podľa `REPORT_TTL_DAYS` (default 14).

Ukážky: **Ukážka** (stredné skóre) a odkaz **Slabý web** na homepage.

Ďalšie funkcie:
- **Budget** — min. skóre + max. LCP (PASS/FAIL v reporte)
- **Sitemap crawl** — režim Sitemap na homepage → `/c/[id]`
- **Lighthouse kategórie** — Performance, Accessibility, Best Practices, SEO
- **Annotácie** — „opravené“ na opportunities (localStorage)
- **OG image** — `/r/[id]/opengraph-image` podľa skóre
- **PDF** — skutočný download (nie print dialóg)
- **Deep link** — `/r/[id]?s=desktop`

## E2E (Playwright)

```bash
pnpm test:e2e        # spustí Chromium (+ mobil) proti next dev
pnpm test:e2e:ui     # interaktívny UI mód
```

V CI najprv `pnpm build`, potom `CI=1 pnpm test:e2e` (použije `next start`).

