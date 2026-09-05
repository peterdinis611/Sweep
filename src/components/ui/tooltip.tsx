"use client"

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import * as stylex from "@stylexjs/stylex"
import { colors, fonts } from "@/styles/tokens.stylex"

const styles = stylex.create({
  positioner: {
    isolation: "isolate",
    zIndex: 50,
  },
  content: {
    zIndex: 50,
    display: "inline-flex",
    width: "fit-content",
    maxWidth: "20rem",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.line,
    backgroundColor: colors.fg,
    paddingInline: "0.75rem",
    paddingBlock: "0.375rem",
    fontFamily: fonts.mono,
    fontSize: "0.65rem",
    letterSpacing: "0.04em",
    color: colors.bg,
  },
})

function TooltipProvider({ delay = 0, ...props }: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delay={delay} {...props} />
}

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  style,
  side = "top",
  sideOffset = 6,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: Omit<TooltipPrimitive.Popup.Props, "className" | "style"> &
  Pick<TooltipPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> & {
    style?: stylex.StyleXStyles
  }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        {...stylex.props(styles.positioner)}
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          {...props}
          {...stylex.props(styles.content, style)}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
