import { JsonLd } from "@/components/json-ld"
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/config/site"

export function SiteJsonLd() {
  const url = siteUrl()
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: SITE_NAME,
          url,
          description: SITE_DESCRIPTION,
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Any",
          browserRequirements: "Requires Chrome or Chromium for local Lighthouse",
          inLanguage: ["sk", "cs", "en"],
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "EUR",
          },
          featureList: [
            "Core Web Vitals",
            "Lighthouse lab runs",
            "Sitemap crawl",
            "Performance budgets",
            "Waterfall analysis",
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          url,
          description: SITE_DESCRIPTION,
          inLanguage: ["sk", "cs", "en"],
        }}
      />
    </>
  )
}
