import { normalizeUrl } from "@/analysis/pagespeed"

const MAX_URLS = 8

/** Stiahne sitemap.xml a vráti až N HTML URL (bez assetov). */
export async function fetchSitemapUrls(raw: string, limit = 5, signal?: AbortSignal): Promise<string[]> {
  const sitemapUrl = normalizeSitemapUrl(raw)
  const res = await fetch(sitemapUrl, {
    signal,
    headers: { Accept: "application/xml,text/xml,*/*" },
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Sitemap sa nepodarilo stiahnuť (HTTP ${res.status}).`)
  const xml = await res.text()
  const locs = extractLocs(xml)
  if (!locs.length) throw new Error("V sitemape som nenašiel žiadne <loc> URL.")

  const pages: string[] = []
  const seen = new Set<string>()
  for (const loc of locs) {
    if (pages.length >= Math.min(limit, MAX_URLS)) break
    let href: string
    try {
      href = normalizeUrl(loc)
    } catch {
      continue
    }
    if (isAsset(href)) continue
    if (looksLikeSitemap(href)) {
      // nested sitemap index — one level deep
      try {
        const nested = await fetch(href, { signal, cache: "no-store" })
        if (!nested.ok) continue
        for (const nestedLoc of extractLocs(await nested.text())) {
          if (pages.length >= Math.min(limit, MAX_URLS)) break
          try {
            const n = normalizeUrl(nestedLoc)
            if (isAsset(n) || looksLikeSitemap(n) || seen.has(n)) continue
            seen.add(n)
            pages.push(n)
          } catch {
            /* skip */
          }
        }
      } catch {
        /* skip nested */
      }
      continue
    }
    if (seen.has(href)) continue
    seen.add(href)
    pages.push(href)
  }

  if (!pages.length) throw new Error("Sitemap neobsahuje použiteľné stránky na meranie.")
  return pages
}

function normalizeSitemapUrl(raw: string) {
  const url = normalizeUrl(raw)
  if (looksLikeSitemap(url)) return url
  // allow entering site root — try /sitemap.xml
  const u = new URL(url)
  if (u.pathname === "/" || u.pathname === "") {
    u.pathname = "/sitemap.xml"
    return u.toString()
  }
  return url
}

function extractLocs(xml: string) {
  const out: string[] = []
  const re = /<loc[^>]*>\s*([^<]+?)\s*<\/loc>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(xml))) {
    const v = m[1]?.trim()
    if (v) out.push(v)
  }
  return out
}

function looksLikeSitemap(url: string) {
  return /sitemap.*\.xml($|\?)/i.test(url) || /\/sitemap\/?$/i.test(url)
}

function isAsset(url: string) {
  return /\.(pdf|jpg|jpeg|png|gif|webp|svg|css|js|mjs|map|woff2?|ttf|zip|mp4|webm)($|\?)/i.test(url)
}
