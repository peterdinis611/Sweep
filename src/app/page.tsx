import { MeasureWorkspace } from "@/components/measure-workspace"
import { SiteJsonLd } from "@/components/site-json-ld"
import { HomeHero } from "@/components/home-hero"

export const maxDuration = 180

export default function HomePage() {
  return (
    <>
      <SiteJsonLd />
      <MeasureWorkspace key="home" hero={<HomeHero />} />
    </>
  )
}
