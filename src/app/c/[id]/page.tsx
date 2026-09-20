import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { loadCrawl } from "@/analysis/crawl-store"
import { CrawlView } from "@/components/crawl-view"

export const dynamic = "force-dynamic"
export const maxDuration = 180

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const crawl = await loadCrawl(id)
  if (!crawl) return { title: "Crawl", robots: { index: false } }
  return {
    title: `Sitemap crawl · ${crawl.items.length} URL`,
    robots: { index: false, follow: false },
  }
}

export default async function CrawlPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const crawl = await loadCrawl(id)
  if (!crawl) notFound()
  return <CrawlView crawl={crawl} />
}
