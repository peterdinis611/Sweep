import { Input as InputPrimitive } from "@base-ui/react/input"
import * as stylex from "@stylexjs/stylex"
import { colors, fonts } from "@/styles/tokens.stylex"

const styles = stylex.create({
  root: {
    height: "2.5rem",
    width: "100%",
    minWidth: 0,
    borderRadius: 3,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.line,
    backgroundColor: "transparent",
    paddingInline: "0.75rem",
    paddingBlock: "0.25rem",
    fontFamily: fonts.mono,
    fontSize: "0.875rem",
    color: colors.fg,
    outline: "none",
    transitionProperty: "border-color, box-shadow",
    transitionDuration: "150ms",
    "::placeholder": {
      color: "color-mix(in oklab, var(--muted) 70%, transparent)",
    },
    ":focus-visible": {
      borderColor: colors.accent,
      boxShadow: "0 0 0 2px color-mix(in oklab, var(--accent) 30%, transparent)",
    },
    ":disabled": {
      pointerEvents: "none",
      cursor: "not-allowed",
      opacity: 0.5,
    },
    ":is([aria-invalid=true])": {
      borderColor: colors.bad,
      boxShadow: "0 0 0 2px color-mix(in oklab, var(--bad) 25%, transparent)",
    },
  },
  flush: {
    height: "3.5rem",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    borderRadius: 0,
    borderWidth: 0,
    paddingInline: "1rem",
    fontSize: "0.95rem",
    ":focus-visible": {
      boxShadow: "0 0 #0000",
    },
  },
})

function Input({
  type,
  style,
  ...props
}: Omit<React.ComponentProps<"input">, "className" | "style"> & {
  style?: stylex.StyleXStyles
}) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      {...props}
      {...stylex.props(styles.root, style)}
    />
  )
}

export { Input, styles as inputStyles }
