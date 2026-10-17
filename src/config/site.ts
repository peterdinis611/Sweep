export const SITE_NAME = "Sweep"
export const SITE_TAGLINE = "web performance lab"
export const SITE_TAGLINE_SK = "analýza rýchlosti webu"
export const SITE_DESCRIPTION =
  "Lab measurement of Core Web Vitals, waterfall, and fixes with estimated impact. Mobile and desktop via local Lighthouse (PSI fallback)."
export const SITE_DESCRIPTION_SK =
  "Laboratórne meranie Core Web Vitals, waterfall a opráv s odhadovaným dopadom. Mobil aj desktop cez Lighthouse (PSI ako záloha)."

export function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3005"
  return raw.replace(/\/$/, "")
}
