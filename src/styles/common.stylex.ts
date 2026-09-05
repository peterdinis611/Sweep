import * as stylex from "@stylexjs/stylex"
import { colors, fonts } from "./tokens.stylex"

const rise = stylex.keyframes({
  from: { opacity: 0, transform: "translateY(12px)" },
  to: { opacity: 1, transform: "translateY(0)" },
})

export const common = stylex.create({
  kicker: {
    letterSpacing: "0.28em",
    textTransform: "uppercase",
    fontSize: "0.64rem",
    fontWeight: 500,
    color: colors.muted,
    fontFamily: fonts.mono,
  },
  plate: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.line,
  },
  displayFont: {
    fontFamily: fonts.display,
  },
  monoFont: {
    fontFamily: fonts.mono,
  },
  reveal: {
    animationName: rise,
    animationDuration: "0.65s",
    animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    animationFillMode: "both",
    "@media (prefers-reduced-motion: reduce)": {
      animationDuration: "0s",
    },
  },
  noPrint: {
    "@media print": {
      display: "none",
    },
  },
  ratingGood: { color: colors.good },
  ratingNi: { color: colors.warn },
  ratingPoor: { color: colors.bad },
  srOnly: {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    borderWidth: 0,
  },
})
