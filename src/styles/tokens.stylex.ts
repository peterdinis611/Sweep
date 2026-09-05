import * as stylex from "@stylexjs/stylex"

/**
 * Design tokens as StyleX vars.
 * Light defaults; `.dark` on <html> overrides via CSS custom properties
 * that StyleX wires through these vars.
 */
export const colors = stylex.defineVars({
  bg: "var(--bg)",
  fg: "var(--fg)",
  muted: "var(--muted)",
  card: "var(--card)",
  line: "var(--line)",
  accent: "var(--accent)",
  accentFg: "var(--accent-fg)",
  warn: "var(--warn)",
  bad: "var(--bad)",
  good: "var(--good)",
  secondary: "var(--secondary)",
  glow: "var(--glow)",
})

export const fonts = stylex.defineVars({
  body: "var(--font-body), 'IBM Plex Sans', sans-serif",
  display: "var(--font-display), 'Newsreader', Georgia, serif",
  mono: "var(--font-mono), ui-monospace, monospace",
})
