import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { loadReport, listReportsByUrl } from "@/analysis/store"
import { publicReport, verifyOwner } from "@/analysis/ownership"
import { MeasureWorkspace } from "@/components/measure-workspace"
import { ReportView } from "@/components/report-view"

export const maxDuration = 180
export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const report = await loadReport(id)
  if (!report) {
    return {
      title: "Report sa nenašiel",
      robots: { index: false, follow: false },
    }
  }
  const host = report.finalUrl.replace(/^https?:\/\//, "")
  return {
    title: host,
    description: `Laboratórne skóre mobil ${report.mobile.score} a desktop ${report.desktop.score} pre ${host}.`,
    robots: { index: false, follow: false, nocache: true },
    alternates: { canonical: `/r/${report.id}` },
    openGraph: {
      title: `${host} · Sweep`,
      description: `Mobil ${report.mobile.score} · Desktop ${report.desktop.score}`,
      images: [`/r/${report.id}/opengraph-image`],
    },
    twitter: {
      card: "summary_large_image",
      title: `${host} · Sweep`,
      description: `Mobil ${report.mobile.score} · Desktop ${report.desktop.score}`,
    },
  }
}

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ s?: string; vs?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const report = await loadReport(id)
  if (!report) notFound()

  const vsId = sp.vs && sp.vs !== id ? sp.vs : undefined
  const vsReport = vsId ? await loadReport(vsId) : null
  const previous = report.previousId ? await loadReport(report.previousId) : null
  const compareAgainst = vsReport ?? previous

  const history = (await listReportsByUrl(report.finalUrl || report.url, report.id, 12)).map(publicReport)
  const canDelete = await verifyOwner(report.id, report.ownerToken)

  return (
    <MeasureWorkspace key={report.id} initialUrl={report.url}>
      <Suspense fallback={null}>
        <ReportView
          report={publicReport(report)}
          previous={compareAgainst ? publicReport(compareAgainst) : null}
          compareId={compareAgainst?.id ?? null}
          history={history}
          canDelete={canDelete}
        />
      </Suspense>
    </MeasureWorkspace>
  )
}
