"use client"

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"
import * as stylex from "@stylexjs/stylex"
import { colors } from "@/styles/tokens.stylex"

const styles = stylex.create({
  root: {
    flexShrink: 0,
    backgroundColor: colors.line,
    ":is([data-orientation=horizontal])": {
      height: 1,
      width: "100%",
    },
    ":is([data-orientation=vertical])": {
      width: 1,
      alignSelf: "stretch",
    },
  },
})

function Separator({
  orientation = "horizontal",
  style,
  ...props
}: Omit<SeparatorPrimitive.Props, "className" | "style"> & {
  style?: stylex.StyleXStyles
}) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      {...props}
      {...stylex.props(styles.root, style)}
    />
  )
}

export { Separator, styles as separatorStyles }
