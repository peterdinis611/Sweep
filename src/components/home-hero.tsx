"use client"

import * as stylex from "@stylexjs/stylex"
import { useI18n } from "@/i18n/provider"
import { common } from "@/styles/common.stylex"
import { colors, fonts } from "@/styles/tokens.stylex"

const rise = stylex.keyframes({
  from: { opacity: 0, transform: "translateY(14px)" },
  to: { opacity: 1, transform: "translateY(0)" },
})

const styles = stylex.create({
  root: {
    position: "relative",
    paddingBottom: "0.5rem",
  },
  kicker: {
    animationName: rise,
    animationDuration: "0.7s",
    animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    animationFillMode: "both",
  },
  title: {
    marginTop: "1rem",
    maxWidth: "11ch",
    fontFamily: fonts.display,
    fontSize: "clamp(2.75rem, 7vw, 4.75rem)",
    fontWeight: 500,
    lineHeight: 0.9,
    letterSpacing: "-0.035em",
    animationName: rise,
    animationDuration: "0.75s",
    animationDelay: "80ms",
    animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    animationFillMode: "both",
  },
  em: {
    color: colors.accent,
    fontStyle: "italic",
    fontWeight: 400,
  },
  lead: {
    marginTop: "1.75rem",
    maxWidth: "22rem",
    fontSize: "1.05rem",
    lineHeight: 1.65,
    color: colors.muted,
    animationName: rise,
    animationDuration: "0.75s",
    animationDelay: "150ms",
    animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    animationFillMode: "both",
  },
  rule: {
    marginTop: "2.25rem",
    width: "4.5rem",
    height: 2,
    backgroundColor: colors.accent,
    animationName: rise,
    animationDuration: "0.7s",
    animationDelay: "210ms",
    animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    animationFillMode: "both",
  },
})

export function HomeHero() {
  const { t } = useI18n()
  return (
    <div {...stylex.props(styles.root)}>
      <p {...stylex.props(common.kicker, styles.kicker)}>{t.home.kicker}</p>
      <h1 {...stylex.props(styles.title)}>
        {t.home.title}
        <br />
        <em {...stylex.props(styles.em)}>{t.home.titleEm}</em>
      </h1>
      <p {...stylex.props(styles.lead)}>{t.home.lead}</p>
      <div {...stylex.props(styles.rule)} aria-hidden />
    </div>
  )
}
