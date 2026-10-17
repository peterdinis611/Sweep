import type { Metadata } from "next"
import { MeasureWorkspace } from "@/components/measure-workspace"
import { SiteJsonLd } from "@/components/site-json-ld"
import { HomeHero } from "@/components/home-hero"
import { RecentLabs } from "@/components/recent-labs"
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/config/site"

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} — ${SITE_TAGLINE}` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
}

/** Analysis actions set their own duration; keep the homepage light. */
export const maxDuration = 60

export default function HomePage() {
  return (
    <>
      <SiteJsonLd />
      <MeasureWorkspace key="home" hero={<HomeHero />} />
      <RecentLabs />
    </>
  )
}
