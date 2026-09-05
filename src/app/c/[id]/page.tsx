import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import * as stylex from "@stylexjs/stylex"
import { loadCrawl } from "@/analysis/crawl-store"
import { Button, buttonStyles } from "@/components/ui/button"
import { colors, fonts } from "@/styles/tokens.stylex"
import { common } from "@/styles/common.stylex"

export const dynamic = "force-dynamic"
export const maxDuration = 180

const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
    paddingBottom: "3rem",
  },
  title: {
    marginTop: "0.75rem",
    fontFamily: fonts.display,
    fontSize: "2.2rem",
    fontWeight: 500,
    letterSpacing: "-0.025em",
    lineHeight: 1,
  },
  meta: {
    marginTop: "0.75rem",
    fontFamily: fonts.mono,
    fontSize: "0.7rem",
    color: colors.muted,
    letterSpacing: "0.025em",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.9rem",
  },
  th: {
    textAlign: "left",
    padding: "0.75rem 1rem",
    fontFamily: fonts.mono,
    fontSize: "0.62rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: colors.muted,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colors.line,
  },
  td: {
    padding: "0.85rem 1rem",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colors.line,
    verticalAlign: "top",
  },
  url: {
    fontFamily: fonts.mono,
    fontSize: "0.78rem",
    wordBreak: "break-all",
  },
  pass: { color: colors.good, fontWeight: 500 },
  fail: { color: colors.bad, fontWeight: 500 },
  muted: { color: colors.muted },
})

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const crawl = await loadCrawl(id)
  if (!crawl) return { title: "Crawl sa nenašiel", robots: { index: false } }
  return {
    title: `Sitemap crawl · ${crawl.items.length} URL`,
    robots: { index: false, follow: false },
  }
}

export default async function CrawlPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const crawl = await loadCrawl(id)
  if (!crawl) notFound()

  const passed = crawl.items.filter((i) => i.budgetPassed).length
  const failed = crawl.items.filter((i) => i.reportId && !i.budgetPassed).length
  const errors = crawl.items.filter((i) => i.error).length

  return (
    <div {...stylex.props(styles.root)}>
      <div>
        <p {...stylex.props(common.kicker)}>Sitemap crawl</p>
        <h1 {...stylex.props(styles.title)}>{crawl.items.length} URL zmeraných</h1>
        <p {...stylex.props(styles.meta)}>
          {crawl.sitemapUrl}
          {" · "}
          budget skóre ≥ {crawl.budget.minScore}, LCP ≤ {crawl.budget.maxLcpMs} ms
          {" · "}
          PASS {passed} · FAIL {failed} · ERR {errors}
        </p>
      </div>

      <div {...stylex.props(common.plate)}>
        <table {...stylex.props(styles.table)}>
          <thead>
            <tr>
              <th {...stylex.props(styles.th)}>URL</th>
              <th {...stylex.props(styles.th)}>Mobil</th>
              <th {...stylex.props(styles.th)}>Desktop</th>
              <th {...stylex.props(styles.th)}>Budget</th>
              <th {...stylex.props(styles.th)} />
            </tr>
          </thead>
          <tbody>
            {crawl.items.map((item) => (
              <tr key={item.url}>
                <td {...stylex.props(styles.td, styles.url)}>{item.url}</td>
                <td {...stylex.props(styles.td)}>{item.mobileScore ?? "—"}</td>
                <td {...stylex.props(styles.td)}>{item.desktopScore ?? "—"}</td>
                <td {...stylex.props(styles.td)}>
                  {item.error ? (
                    <span {...stylex.props(styles.fail)} title={item.error}>
                      ERR
                    </span>
                  ) : item.budgetPassed ? (
                    <span {...stylex.props(styles.pass)}>PASS</span>
                  ) : (
                    <span {...stylex.props(styles.fail)}>FAIL</span>
                  )}
                </td>
                <td {...stylex.props(styles.td)}>
                  {item.reportId ? (
                    <Button nativeButton={false} render={<Link href={`/r/${item.reportId}`} />} style={buttonStyles.roundedNone} size="sm" variant="outline">
                      Report
                    </Button>
                  ) : (
                    <span {...stylex.props(styles.muted)}>{item.error?.slice(0, 80)}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <Button nativeButton={false} render={<Link href="/" />} style={buttonStyles.roundedNone}>
          Nové meranie
        </Button>
      </div>
    </div>
  )
}
