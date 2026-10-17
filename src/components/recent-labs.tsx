"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import * as stylex from "@stylexjs/stylex"
import { getRecentLabs } from "@/app/actions"
import type { LabListItem } from "@/analysis/types"
import { useI18n } from "@/i18n/provider"
import { colors, fonts } from "@/styles/tokens.stylex"
import { common } from "@/styles/common.stylex"

const styles = stylex.create({
  root: {
    marginBottom: "3rem",
  },
  head: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: "1rem",
    marginBottom: "0.85rem",
  },
  title: {
    fontFamily: fonts.display,
    fontSize: "1.35rem",
    letterSpacing: "-0.02em",
  },
  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "0.5rem 1rem",
    paddingInline: "1rem",
    paddingBlock: "0.85rem",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colors.line,
    textDecoration: "none",
    color: "inherit",
    transitionProperty: "background-color",
    transitionDuration: "120ms",
    ":hover": {
      backgroundColor: "color-mix(in oklab, var(--accent) 6%, var(--card))",
    },
    ":last-child": {
      borderBottomWidth: 0,
    },
    "@media (min-width: 640px)": {
      gridTemplateColumns: "auto 1fr auto auto",
      alignItems: "center",
    },
  },
  kind: {
    fontFamily: fonts.mono,
    fontSize: "0.62rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: colors.muted,
  },
  host: {
    fontFamily: fonts.mono,
    fontSize: "0.82rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  meta: {
    fontFamily: fonts.mono,
    fontSize: "0.68rem",
    color: colors.muted,
  },
  empty: {
    padding: "1rem",
    fontSize: "0.88rem",
    color: colors.muted,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  pass: { color: colors.good },
  fail: { color: colors.bad },
})

export function RecentLabs() {
  const { t, locale } = useI18n()
  const [items, setItems] = useState<LabListItem[] | null>(null)

  useEffect(() => {
    void getRecentLabs().then((res) => {
      if (res?.data) setItems(res.data)
      else setItems([])
    })
  }, [])

  const dateFmt = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale === "cs" ? "cs-CZ" : "sk-SK", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  return (
    <section data-testid="recent-labs" {...stylex.props(styles.root, common.noPrint)}>
      <div {...stylex.props(styles.head)}>
        <h2 {...stylex.props(styles.title)}>{t.labs.title}</h2>
        <p {...stylex.props(common.kicker)}>{t.labs.ttlHint}</p>
      </div>
      {items === null ? (
        <p {...stylex.props(styles.empty)}>{t.labs.loading}</p>
      ) : items.length === 0 ? (
        <p {...stylex.props(styles.empty)}>{t.labs.empty}</p>
      ) : (
        <ul {...stylex.props(styles.list)}>
          {items.map((item) => (
            <li key={`${item.kind}-${item.id}`}>
              <Link href={item.href} {...stylex.props(styles.row)}>
                <span {...stylex.props(styles.kind)}>
                  {item.kind === "crawl" ? t.labs.crawl : t.labs.report}
                </span>
                <span {...stylex.props(styles.host)} title={item.url}>
                  {item.host}
                </span>
                <span {...stylex.props(styles.meta)}>
                  {dateFmt.format(new Date(item.createdAt))}
                  {item.score != null ? ` · ${item.score}` : ""}
                  {item.passed != null ? (
                    <>
                      {" · "}
                      <span {...stylex.props(item.passed ? styles.pass : styles.fail)}>
                        {item.passed ? "PASS" : "FAIL"}
                      </span>
                    </>
                  ) : null}
                </span>
                <span {...stylex.props(styles.meta)}>
                  {t.labs.expires.replace("{days}", String(item.expiresInDays))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
