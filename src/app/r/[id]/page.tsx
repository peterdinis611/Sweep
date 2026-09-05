import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { loadReport } from "@/analysis/store"
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
    },
  }
}

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const report = await loadReport(id)
  if (!report) notFound()

  const previous = report.previousId ? await loadReport(report.previousId) : null

  return (
    <MeasureWorkspace key={report.id} initialUrl={report.url}>
      <ReportView report={report} previous={previous} />
    </MeasureWorkspace>
  )
}
