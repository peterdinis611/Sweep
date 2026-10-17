import type { MetadataRoute } from "next"
import { siteUrl } from "@/config/site"

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl()
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/r/", "/c/", "/api/", "/400"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}

export const revalidate = 86400
