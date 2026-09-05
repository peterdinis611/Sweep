"use client"

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { ChevronDownIcon } from "lucide-react"
import * as stylex from "@stylexjs/stylex"
import { colors, fonts } from "@/styles/tokens.stylex"

const styles = stylex.create({
  root: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
  },
  item: {
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colors.line,
    ":last-child": {
      borderBottomWidth: 0,
    },
  },
  header: {
    display: "flex",
  },
  trigger: {
    display: "flex",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "1rem",
    paddingBlock: "1rem",
    textAlign: "left",
    fontSize: "0.875rem",
    fontWeight: 500,
    fontFamily: fonts.body,
    color: colors.fg,
    backgroundColor: "transparent",
    borderWidth: 0,
    cursor: "pointer",
    transitionProperty: "background-color",
    transitionDuration: "150ms",
    outline: "none",
    ":hover": {
      backgroundColor: "color-mix(in oklab, var(--bg) 50%, transparent)",
    },
    ":focus-visible": {
      boxShadow: "0 0 0 2px color-mix(in oklab, var(--accent) 35%, transparent)",
    },
    ":disabled": {
      opacity: 0.5,
    },
    ":is([data-panel-open]) > svg": {
      transform: "rotate(180deg)",
    },
  },
  chevron: {
    marginTop: "0.25rem",
    width: "1rem",
    height: "1rem",
    flexShrink: 0,
    color: colors.muted,
    transitionProperty: "transform",
    transitionDuration: "300ms",
  },
  panel: {
    height: "var(--accordion-panel-height)",
    overflow: "hidden",
    fontSize: "0.875rem",
    color: colors.muted,
    transitionProperty: "height",
    transitionDuration: "300ms",
    ":is([data-starting-style], [data-ending-style])": {
      height: 0,
    },
  },
  content: {
    paddingBottom: "1.25rem",
    lineHeight: 1.625,
  },
  triggerPad: {
    paddingInline: "1.25rem",
    paddingBlock: "1rem",
  },
  contentPad: {
    paddingInline: "1.25rem",
    paddingBottom: "1rem",
    fontSize: "0.875rem",
    lineHeight: 1.625,
    color: colors.muted,
    "@media (min-width: 640px)": {
      paddingLeft: "6.5rem",
    },
  },
})

function Accordion({
  style,
  ...props
}: Omit<AccordionPrimitive.Root.Props, "className" | "style"> & {
  style?: stylex.StyleXStyles
}) {
  return (
    <AccordionPrimitive.Root data-slot="accordion" {...props} {...stylex.props(styles.root, style)} />
  )
}

function AccordionItem({
  style,
  ...props
}: Omit<AccordionPrimitive.Item.Props, "className" | "style"> & {
  style?: stylex.StyleXStyles
}) {
  return (
    <AccordionPrimitive.Item data-slot="accordion-item" {...props} {...stylex.props(styles.item, style)} />
  )
}

function AccordionTrigger({
  style,
  children,
  ...props
}: Omit<AccordionPrimitive.Trigger.Props, "className" | "style"> & {
  style?: stylex.StyleXStyles
}) {
  return (
    <AccordionPrimitive.Header {...stylex.props(styles.header)}>
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        {...props}
        {...stylex.props(styles.trigger, style)}
      >
        {children}
        <ChevronDownIcon {...stylex.props(styles.chevron)} />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionPanel({
  style,
  ...props
}: Omit<AccordionPrimitive.Panel.Props, "className" | "style"> & {
  style?: stylex.StyleXStyles
}) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-panel"
      {...props}
      {...stylex.props(styles.panel, style)}
    />
  )
}

function AccordionContent({
  style,
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style"> & {
  style?: stylex.StyleXStyles
}) {
  return <div data-slot="accordion-content" {...props} {...stylex.props(styles.content, style)} />
}

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
  AccordionContent,
  styles as accordionStyles,
}
