"use client"

import * as stylex from "@stylexjs/stylex"
import { useI18n } from "@/i18n/provider"
import { common } from "@/styles/common.stylex"
import { colors, fonts } from "@/styles/tokens.stylex"

const styles = stylex.create({
  root: {
    position: "relative",
  },
  title: {
    marginTop: "1.25rem",
    maxWidth: "14ch",
    fontFamily: fonts.display,
    fontSize: "3.15rem",
    fontWeight: 500,
    lineHeight: 0.92,
    letterSpacing: "-0.02em",
    "@media (min-width: 640px)": {
      fontSize: "4.4rem",
    },
  },
  em: {
    color: colors.accent,
    fontStyle: "italic",
  },
  lead: {
    marginTop: "1.5rem",
    maxWidth: "24rem",
    fontSize: "1.05rem",
    lineHeight: 1.625,
    color: colors.muted,
  },
  delay80: { animationDelay: "80ms" },
  delay150: { animationDelay: "150ms" },
})

export function HomeHero() {
  const { t } = useI18n()
  return (
    <div {...stylex.props(styles.root)}>
      <span {...stylex.props(common.kicker, common.reveal)}>{t.home.kicker}</span>
      <h1 {...stylex.props(styles.title, common.reveal, styles.delay80)}>
        {t.home.title}
        <br />
        <em {...stylex.props(styles.em)}>{t.home.titleEm}</em>
      </h1>
      <p {...stylex.props(styles.lead, common.reveal, styles.delay150)}>{t.home.lead}</p>
    </div>
  )
}
