"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import * as stylex from "@stylexjs/stylex"
import { ThemeToggle } from "./theme-toggle"
import { LocaleToggle } from "./locale-toggle"
import { useI18n } from "@/i18n/provider"
import { common } from "@/styles/common.stylex"
import { colors, fonts } from "@/styles/tokens.stylex"

const styles = stylex.create({
  header: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "1.5rem",
    paddingBlock: "1.25rem",
  },
  brand: {
    display: "flex",
    alignItems: "baseline",
    gap: "0.75rem",
  },
  mark: {
    marginBottom: "0.125rem",
    width: "1.5rem",
    height: "1.5rem",
    color: colors.accent,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: "1.65rem",
    lineHeight: 1,
    letterSpacing: "-0.02em",
  },
  tools: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "0.75rem",
    paddingBottom: "0.125rem",
    "@media (min-width: 640px)": {
      gap: "1rem",
    },
  },
  newScan: {
    display: "none",
    transitionProperty: "color",
    transitionDuration: "150ms",
    ":hover": {
      color: colors.accent,
    },
    "@media (min-width: 640px)": {
      display: "block",
    },
  },
  lab: {
    display: "none",
    "@media (min-width: 1024px)": {
      display: "block",
    },
  },
})

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useI18n()
  const onReport = pathname.startsWith("/r/")

  return (
    <header {...stylex.props(styles.header, common.noPrint)}>
      <Link
        href="/"
        {...stylex.props(styles.brand)}
        onClick={(e) => {
          if (onReport) {
            e.preventDefault()
            window.location.assign("/")
            return
          }
          if (pathname === "/") {
            e.preventDefault()
            router.refresh()
            window.scrollTo({ top: 0, behavior: "smooth" })
          }
        }}
      >
        <svg viewBox="0 0 32 32" {...stylex.props(styles.mark)} aria-hidden>
          <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M8 18.5c3-6 6.5-9 8-9 2.5 0 4 4 8 9"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        <span {...stylex.props(styles.name, common.displayFont)}>Sweep</span>
      </Link>
      <div {...stylex.props(styles.tools)}>
        {onReport ? (
          <Link
            href="/"
            {...stylex.props(common.kicker, styles.newScan)}
            onClick={(e) => {
              e.preventDefault()
              window.location.assign("/")
            }}
          >
            {t.header.newScan}
          </Link>
        ) : (
          <p {...stylex.props(common.kicker, styles.lab)}>{t.header.lab}</p>
        )}
        <LocaleToggle />
        <ThemeToggle />
      </div>
    </header>
  )
}
