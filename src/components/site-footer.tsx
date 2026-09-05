"use client"

import * as stylex from "@stylexjs/stylex"
import { useI18n } from "@/i18n/provider"
import { common } from "@/styles/common.stylex"
import { colors, fonts } from "@/styles/tokens.stylex"

const styles = stylex.create({
  footer: {
    marginTop: "auto",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: "0.75rem",
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: colors.line,
    paddingBlock: "1.5rem",
    fontSize: "0.7rem",
    color: colors.muted,
  },
  meta: {
    fontFamily: fonts.mono,
    letterSpacing: "0.04em",
  },
})

export function SiteFooter() {
  const { t } = useI18n()
  return (
    <footer {...stylex.props(styles.footer, common.noPrint)}>
      <p {...stylex.props(common.kicker)}>{t.footer.tag}</p>
      <p {...stylex.props(styles.meta)}>PSI · Lighthouse · Core Web Vitals</p>
    </footer>
  )
}
