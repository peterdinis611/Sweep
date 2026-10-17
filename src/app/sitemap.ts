import type { MetadataRoute } from "next"
import { siteUrl } from "@/config/site"

/** Public indexable URLs only — reports/crawls stay out of the sitemap. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl()
  const now = new Date()
  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ]
}

/** Cache sitemap for a day — content rarely changes. */
export const revalidate = 86400
