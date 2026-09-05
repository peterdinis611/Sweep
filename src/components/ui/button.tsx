import { Button as ButtonPrimitive } from "@base-ui/react/button"
import * as stylex from "@stylexjs/stylex"
import { colors, fonts } from "@/styles/tokens.stylex"

const styles = stylex.create({
  base: {
    display: "inline-flex",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 3,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "transparent",
    fontSize: "0.68rem",
    fontWeight: 600,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    outline: "none",
    userSelect: "none",
    cursor: "pointer",
    transitionProperty: "background, color, border-color, filter, transform, box-shadow",
    transitionDuration: "150ms",
    fontFamily: fonts.body,
    gap: "0.375rem",
    ":focus-visible": {
      borderColor: colors.accent,
      boxShadow: "0 0 0 2px color-mix(in oklab, var(--accent) 35%, transparent)",
    },
    ":disabled": {
      pointerEvents: "none",
      opacity: 0.45,
    },
    ":active": {
      transform: "translateY(1px)",
    },
  },
  default: {
    backgroundColor: colors.accent,
    color: colors.accentFg,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14)",
    ":hover": {
      filter: "brightness(1.1)",
    },
  },
  outline: {
    borderColor: colors.line,
    backgroundColor: "transparent",
    color: colors.fg,
    ":hover": {
      borderColor: colors.accent,
      backgroundColor: "color-mix(in oklab, var(--secondary) 50%, transparent)",
      color: colors.accent,
    },
  },
  secondary: {
    backgroundColor: colors.secondary,
    color: colors.fg,
    ":hover": { filter: "brightness(1.05)" },
  },
  ghost: {
    backgroundColor: "transparent",
    color: colors.muted,
    ":hover": {
      backgroundColor: "color-mix(in oklab, var(--secondary) 45%, transparent)",
      color: colors.fg,
    },
  },
  destructive: {
    backgroundColor: colors.bad,
    color: colors.accentFg,
    ":hover": { filter: "brightness(1.1)" },
  },
  link: {
    textTransform: "none",
    letterSpacing: "normal",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: colors.accent,
    backgroundColor: "transparent",
    textUnderlineOffset: 4,
    ":hover": { textDecoration: "underline" },
  },
  sizeDefault: { height: "2.65rem", paddingInline: "1.15rem" },
  sizeSm: { height: "2rem", paddingInline: "0.75rem", fontSize: "0.62rem", gap: "0.25rem" },
  sizeLg: { height: "3.5rem", paddingInline: "1.5rem", fontSize: "0.72rem", gap: "0.5rem" },
  sizeIcon: { width: "2.65rem", height: "2.65rem", padding: 0 },
  roundedNone: { borderRadius: 0 },
  mt8: { marginTop: "2rem" },
  formDemo: {
    minWidth: "6.5rem",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    borderRadius: 0,
    borderWidth: 0,
    borderRightWidth: 1,
    borderRightStyle: "solid",
    borderRightColor: colors.line,
    "@media (min-width: 640px)": {
      flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    },
  },
  formSubmit: {
    minWidth: "8.5rem",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    borderRadius: 0,
    "@media (min-width: 640px)": {
      flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    },
  },
})

type Variant = "default" | "outline" | "secondary" | "ghost" | "destructive" | "link"
type Size = "default" | "sm" | "lg" | "icon"

const variantMap = {
  default: styles.default,
  outline: styles.outline,
  secondary: styles.secondary,
  ghost: styles.ghost,
  destructive: styles.destructive,
  link: styles.link,
} as const

const sizeMap = {
  default: styles.sizeDefault,
  sm: styles.sizeSm,
  lg: styles.sizeLg,
  icon: styles.sizeIcon,
} as const

export function Button({
  variant = "default",
  size = "default",
  style,
  ...props
}: Omit<ButtonPrimitive.Props, "className" | "style"> & {
  variant?: Variant
  size?: Size
  style?: stylex.StyleXStyles
}) {
  return (
    <ButtonPrimitive
      data-slot="button"
      {...props}
      {...stylex.props(styles.base, variantMap[variant], sizeMap[size], style)}
    />
  )
}

export { styles as buttonStyles }
