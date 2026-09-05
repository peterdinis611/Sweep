"use client"

import * as stylex from "@stylexjs/stylex"
import { useI18n } from "@/i18n/provider"
import { LOCALES, type Locale } from "@/i18n/messages"
import { colors, fonts } from "@/styles/tokens.stylex"

const styles = stylex.create({
  group: {
    display: "flex",
    alignItems: "stretch",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.line,
  },
  btn: {
    paddingInline: "0.5rem",
    paddingBlock: "0.375rem",
    fontFamily: fonts.mono,
    fontSize: "0.62rem",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    borderWidth: 0,
    cursor: "pointer",
    transitionProperty: "background-color, color",
    transitionDuration: "150ms",
    backgroundColor: "transparent",
    color: colors.muted,
    ":hover": {
      color: colors.fg,
    },
  },
  active: {
    backgroundColor: colors.accent,
    color: colors.accentFg,
    ":hover": {
      color: colors.accentFg,
    },
  },
})

export function LocaleToggle() {
  const { locale, setLocale, t } = useI18n()

  return (
    <div role="group" aria-label={t.lang.label} data-testid="locale-toggle" {...stylex.props(styles.group)}>
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          data-testid={`locale-${code}`}
          {...stylex.props(styles.btn, locale === code && styles.active)}
          aria-pressed={locale === code}
          onClick={() => setLocale(code)}
        >
          {t.lang[code as Locale]}
        </button>
      ))}
    </div>
  )
}
