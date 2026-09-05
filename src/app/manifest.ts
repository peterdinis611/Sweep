import type { MetadataRoute } from "next"
import { SITE_DESCRIPTION, SITE_NAME } from "@/config/site"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — analýza rýchlosti webu`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#f4f1ea",
    theme_color: "#0a2458",
    lang: "sk",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  }
}
