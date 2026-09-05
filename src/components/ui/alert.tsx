import * as stylex from "@stylexjs/stylex"
import { colors, fonts } from "@/styles/tokens.stylex"

const styles = stylex.create({
  root: {
    position: "relative",
    display: "grid",
    width: "100%",
    gridTemplateColumns: "auto 1fr",
    alignItems: "start",
    columnGap: "0.75rem",
    rowGap: "0.125rem",
    borderRadius: 3,
    borderWidth: 1,
    borderStyle: "solid",
    paddingInline: "1rem",
    paddingBlock: "0.75rem",
    fontSize: "0.875rem",
    fontFamily: fonts.body,
  },
  default: {
    borderColor: colors.line,
    backgroundColor: colors.card,
    color: colors.fg,
  },
  destructive: {
    borderColor: "color-mix(in oklab, var(--bad) 35%, transparent)",
    backgroundColor: "color-mix(in oklab, var(--bad) 10%, transparent)",
    color: colors.bad,
  },
  title: {
    fontWeight: 500,
    letterSpacing: "-0.01em",
  },
  description: {
    fontFamily: fonts.mono,
    fontSize: "0.75rem",
    letterSpacing: "0.04em",
  },
  descriptionPlain: {
    textTransform: "none",
    letterSpacing: "normal",
  },
  mt3: {
    marginTop: "0.75rem",
  },
})

type Variant = "default" | "destructive"

const variantMap = {
  default: styles.default,
  destructive: styles.destructive,
} as const

function Alert({
  variant = "default",
  style,
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style"> & {
  variant?: Variant
  style?: stylex.StyleXStyles
}) {
  return (
    <div
      data-slot="alert"
      role="alert"
      {...props}
      {...stylex.props(styles.root, variantMap[variant], style)}
    />
  )
}

function AlertTitle({
  style,
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style"> & {
  style?: stylex.StyleXStyles
}) {
  return <div data-slot="alert-title" {...props} {...stylex.props(styles.title, style)} />
}

function AlertDescription({
  style,
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style"> & {
  style?: stylex.StyleXStyles
}) {
  return (
    <div data-slot="alert-description" {...props} {...stylex.props(styles.description, style)} />
  )
}

export { Alert, AlertTitle, AlertDescription, styles as alertStyles }
