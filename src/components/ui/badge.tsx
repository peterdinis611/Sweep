import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import * as stylex from "@stylexjs/stylex"
import { colors, fonts } from "@/styles/tokens.stylex"

const styles = stylex.create({
  base: {
    display: "inline-flex",
    width: "fit-content",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "solid",
    paddingInline: "0.5rem",
    paddingBlock: "0.125rem",
    fontFamily: fonts.mono,
    fontSize: "0.62rem",
    fontWeight: 500,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  default: {
    borderColor: "transparent",
    backgroundColor: colors.accent,
    color: colors.accentFg,
  },
  secondary: {
    borderColor: "transparent",
    backgroundColor: colors.secondary,
    color: colors.fg,
  },
  destructive: {
    borderColor: "color-mix(in oklab, var(--bad) 35%, transparent)",
    backgroundColor: "color-mix(in oklab, var(--bad) 10%, transparent)",
    color: colors.bad,
  },
  outline: {
    borderColor: colors.line,
    backgroundColor: "transparent",
    color: colors.fg,
  },
  high: {
    borderColor: "transparent",
    backgroundColor: "transparent",
    color: colors.bad,
  },
  medium: {
    borderColor: "transparent",
    backgroundColor: "transparent",
    color: colors.warn,
  },
  low: {
    borderColor: "transparent",
    backgroundColor: "transparent",
    color: colors.muted,
  },
  impact: {
    marginTop: "0.125rem",
    minWidth: "4.5rem",
    justifyContent: "flex-start",
    borderWidth: 0,
    paddingInline: 0,
  },
})

type Variant = "default" | "secondary" | "destructive" | "outline" | "high" | "medium" | "low"

const variantMap = {
  default: styles.default,
  secondary: styles.secondary,
  destructive: styles.destructive,
  outline: styles.outline,
  high: styles.high,
  medium: styles.medium,
  low: styles.low,
} as const

function Badge({
  variant = "default",
  style,
  render,
  ...props
}: Omit<useRender.ComponentProps<"span">, "className" | "style"> & {
  variant?: Variant
  style?: stylex.StyleXStyles
}) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(stylex.props(styles.base, variantMap[variant], style), props),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, styles as badgeStyles }
