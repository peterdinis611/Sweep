import * as stylex from "@stylexjs/stylex"
import { colors, fonts } from "@/styles/tokens.stylex"

const styles = stylex.create({
  root: {
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: 1,
    fontFamily: fonts.body,
    color: colors.fg,
  },
})

function Label({
  style,
  ...props
}: Omit<React.ComponentProps<"label">, "className" | "style"> & {
  style?: stylex.StyleXStyles
}) {
  return <label data-slot="label" {...props} {...stylex.props(styles.root, style)} />
}

export { Label, styles as labelStyles }
