import type { Metadata } from "next"
import { connection } from "next/server"
import { MeasureWorkspace } from "@/components/measure-workspace"
import { SiteJsonLd } from "@/components/site-json-ld"
import { HomeHero } from "@/components/home-hero"
import { RecentLabs } from "@/components/recent-labs"
import { demosEnabled } from "@/config/flags"
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/config/site"

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} — ${SITE_TAGLINE}` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
}

/** Analysis actions set their own duration; keep the homepage light. */
export const maxDuration = 60

/** Runtime env (SWEEP_ALLOW_DEMO) must apply — do not bake demos into static HTML at build. */
export default async function HomePage() {
  await connection()
  return (
    <>
      <SiteJsonLd />
      <MeasureWorkspace key="home" hero={<HomeHero />} showDemos={demosEnabled()} />
      <RecentLabs />
    </>
  )
}
