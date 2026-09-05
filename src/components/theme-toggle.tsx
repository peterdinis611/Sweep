"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import * as stylex from "@stylexjs/stylex"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/i18n/provider"
import { THEME_KEY } from "@/i18n/messages"
import { common } from "@/styles/common.stylex"
import { fonts } from "@/styles/tokens.stylex"

const styles = stylex.create({
  button: {
    gap: "0.5rem",
    paddingInline: "0.625rem",
  },
  icon: {
    width: "0.875rem",
    height: "0.875rem",
  },
  label: {
    letterSpacing: "0.18em",
    fontFamily: fonts.mono,
  },
})

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark)
  localStorage.setItem(THEME_KEY, dark ? "dark" : "light")
}

export function ThemeToggle() {
  const { t } = useI18n()
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"))
  }, [])

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      data-testid="theme-toggle"
      aria-label={dark ? t.theme.toLight : t.theme.toDark}
      style={styles.button}
      onClick={() => {
        const next = !dark
        setDark(next)
        applyTheme(next)
      }}
    >
      {dark ? <Sun {...stylex.props(styles.icon)} /> : <Moon {...stylex.props(styles.icon)} />}
      <span {...stylex.props(common.kicker, styles.label)}>{dark ? t.theme.dark : t.theme.light}</span>
    </Button>
  )
}
