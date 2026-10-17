"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import * as stylex from "@stylexjs/stylex"
import { getRecentLabs } from "@/app/actions"
import type { LabListItem } from "@/analysis/types"
import { useI18n } from "@/i18n/provider"
import { colors, fonts } from "@/styles/tokens.stylex"
import { common } from "@/styles/common.stylex"

const rise = stylex.keyframes({
  from: { opacity: 0, transform: "translateY(8px)" },
  to: { opacity: 1, transform: "translateY(0)" },
})

const styles = stylex.create({
  root: {
    marginBottom: "2.25rem",
    minWidth: 0,
    animationName: rise,
    animationDuration: "0.55s",
    animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    animationFillMode: "both",
    "@media (min-width: 640px)": {
      marginBottom: "3rem",
    },
  },
  head: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: "0.5rem 1rem",
    marginBottom: "0.95rem",
  },
  title: {
    fontFamily: fonts.display,
    fontSize: "clamp(1.25rem, 3vw, 1.45rem)",
    letterSpacing: "-0.025em",
    lineHeight: 1.1,
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
    gridTemplateColumns: "1fr",
    gap: "0.3rem",
    paddingInline: "0.9rem",
    paddingBlock: "0.9rem",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colors.line,
    textDecoration: "none",
    color: "inherit",
    transitionProperty: "background-color, border-color",
    transitionDuration: "140ms",
    ":hover": {
      backgroundColor: "color-mix(in oklab, var(--accent) 7%, var(--card))",
    },
    ":last-child": {
      borderBottomWidth: 0,
    },
    "@media (min-width: 640px)": {
      gridTemplateColumns: "5.5rem 1fr auto auto",
      alignItems: "center",
      gap: "0.35rem 1rem",
      paddingInline: "1.05rem",
      paddingBlock: "0.95rem",
    },
  },
  kind: {
    fontFamily: fonts.mono,
    fontSize: "0.6rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: colors.muted,
  },
  host: {
    fontFamily: fonts.mono,
    fontSize: "0.84rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  meta: {
    fontFamily: fonts.mono,
    fontSize: "0.66rem",
    letterSpacing: "0.02em",
    color: colors.muted,
  },
  metaExpire: {
    fontFamily: fonts.mono,
    fontSize: "0.66rem",
    letterSpacing: "0.02em",
    color: colors.muted,
    "@media (max-width: 639px)": {
      opacity: 0.85,
    },
  },
  score: {
    fontFamily: fonts.display,
    fontSize: "1.05rem",
    letterSpacing: "-0.02em",
    fontFeatureSettings: '"tnum"',
    color: colors.fg,
  },
  badge: {
    display: "inline-block",
    marginLeft: "0.35rem",
    borderWidth: 1,
    borderStyle: "solid",
    paddingInline: "0.35rem",
    paddingBlock: "0.08rem",
    fontSize: "0.55rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  empty: {
    padding: "1.15rem 1.05rem",
    fontSize: "0.9rem",
    color: colors.muted,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  pass: {
    color: colors.good,
    borderColor: "color-mix(in oklab, var(--good) 45%, var(--line))",
  },
  fail: {
    color: colors.bad,
    borderColor: "color-mix(in oklab, var(--bad) 45%, var(--line))",
  },
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
                  {item.score != null ? (
                    <>
                      {" · "}
                      <span {...stylex.props(styles.score)}>{item.score}</span>
                    </>
                  ) : null}
                  {item.passed != null ? (
                    <span {...stylex.props(styles.badge, item.passed ? styles.pass : styles.fail)}>
                      {item.passed ? "PASS" : "FAIL"}
                    </span>
                  ) : null}
                </span>
                <span {...stylex.props(styles.metaExpire)}>
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
