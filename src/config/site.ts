export const SITE_NAME = "Sweep"
export const SITE_TAGLINE = "analýza rýchlosti webu"
export const SITE_DESCRIPTION =
  "Laboratórne meranie Core Web Vitals, waterfall a opráv s odhadovaným dopadom. Mobil aj desktop cez PageSpeed Insights a Lighthouse."

export function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3005"
  return raw.replace(/\/$/, "")
}
