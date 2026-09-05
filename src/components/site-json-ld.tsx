import { JsonLd } from "@/components/json-ld"
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/config/site"

export function SiteJsonLd() {
  const url = siteUrl()
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: SITE_NAME,
        url,
        description: SITE_DESCRIPTION,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        inLanguage: "sk",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR",
        },
      }}
    />
  )
}
