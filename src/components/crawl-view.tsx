"use client"

import Link from "next/link"
import { useState } from "react"
import { Check, Download, Share2 } from "lucide-react"
import * as stylex from "@stylexjs/stylex"
import type { Crawl } from "@/analysis/types"
import { normalizeBudget } from "@/analysis/budget"
import { formatMs } from "@/analysis/pagespeed"
import { Button, buttonStyles } from "@/components/ui/button"
import { useI18n } from "@/i18n/provider"
import { colors, fonts } from "@/styles/tokens.stylex"
import { common } from "@/styles/common.stylex"

const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
    paddingBottom: "3rem",
  },
  head: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "1rem",
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
    lineHeight: 1.55,
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
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

function tpl(template: string, vars: Record<string, string | number>) {
  return Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, String(v)), template)
}

export function CrawlView({ crawl }: { crawl: Crawl }) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)

  const passed = crawl.items.filter((i) => i.budgetPassed).length
  const failed = crawl.items.filter((i) => i.reportId && !i.budgetPassed).length
  const errors = crawl.items.filter((i) => i.error).length
  const budget = normalizeBudget(crawl.budget)

  async function share() {
    const link = window.location.href
    await navigator.clipboard.writeText(link)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  function downloadCsv() {
    const rows = [
      ["url", "mobile", "desktop", "budget", "reportId", "error"],
      ...crawl.items.map((i) => [
        i.url,
        i.mobileScore ?? "",
        i.desktopScore ?? "",
        i.error ? "ERR" : i.budgetPassed ? "PASS" : "FAIL",
        i.reportId ?? "",
        i.error ?? "",
      ]),
    ]
    const body = rows.map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n")
    const blob = new Blob([body], { type: "text/csv;charset=utf-8" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `sweep-crawl-${crawl.id.slice(0, 8)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div data-testid="crawl-view" {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.head)}>
        <div>
          <p {...stylex.props(common.kicker)}>{t.crawl.kicker}</p>
          <h1 {...stylex.props(styles.title)}>{tpl(t.crawl.title, { count: crawl.items.length })}</h1>
          <p {...stylex.props(styles.meta)}>
            {crawl.sitemapUrl}
            {" · "}
            {tpl(t.crawl.metaBudget, {
              minScore: budget.minScore,
              maxLcp: budget.maxLcpMs,
              maxCls: budget.maxCls.toFixed(3),
              maxTbt: formatMs(budget.maxTbtMs),
            })}
            {" · "}
            {t.crawl.pass} {passed} · {t.crawl.fail} {failed} · {t.crawl.err} {errors}
          </p>
        </div>
        <div {...stylex.props(styles.actions)}>
          <Button
            type="button"
            size="sm"
            variant="outline"
            data-testid="crawl-share"
            style={buttonStyles.roundedNone}
            onClick={() => void share()}
          >
            {copied ? <Check size={14} /> : <Share2 size={14} />}
            {copied ? t.crawl.copied : t.crawl.share}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            data-testid="crawl-csv"
            style={buttonStyles.roundedNone}
            onClick={downloadCsv}
          >
            <Download size={14} /> {t.crawl.csv}
          </Button>
        </div>
      </div>

      <div {...stylex.props(common.plate)}>
        <table {...stylex.props(styles.table)}>
          <thead>
            <tr>
              <th {...stylex.props(styles.th)}>{t.crawl.colUrl}</th>
              <th {...stylex.props(styles.th)}>{t.crawl.colMobile}</th>
              <th {...stylex.props(styles.th)}>{t.crawl.colDesktop}</th>
              <th {...stylex.props(styles.th)}>{t.crawl.colBudget}</th>
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
                      {t.crawl.err}
                    </span>
                  ) : item.budgetPassed ? (
                    <span {...stylex.props(styles.pass)}>{t.crawl.pass}</span>
                  ) : (
                    <span {...stylex.props(styles.fail)}>{t.crawl.fail}</span>
                  )}
                </td>
                <td {...stylex.props(styles.td)}>
                  {item.reportId ? (
                    <Button
                      nativeButton={false}
                      render={<Link href={`/r/${item.reportId}`} />}
                      style={buttonStyles.roundedNone}
                      size="sm"
                      variant="outline"
                    >
                      {t.crawl.report}
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
          {t.crawl.newScan}
        </Button>
      </div>
    </div>
  )
}
