"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import * as stylex from "@stylexjs/stylex"
import { colors, fonts } from "@/styles/tokens.stylex"

const styles = stylex.create({
  root: {
    display: "flex",
    gap: "0.5rem",
    ":is([data-orientation=horizontal])": {
      flexDirection: "column",
    },
  },
  list: {
    display: "inline-flex",
    width: "fit-content",
    alignItems: "center",
    justifyContent: "center",
    color: colors.muted,
    gap: 1,
    backgroundColor: "transparent",
    padding: 0,
  },
  listLine: {
    gap: "0.25rem",
  },
  trigger: {
    position: "relative",
    display: "inline-flex",
    height: "2.65rem",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.375rem",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "transparent",
    borderRadius: 0,
    backgroundColor: colors.card,
    paddingInline: "1.15rem",
    fontSize: "0.68rem",
    fontWeight: 600,
    letterSpacing: "0.16em",
    whiteSpace: "nowrap",
    textTransform: "uppercase",
    color: colors.muted,
    fontFamily: fonts.body,
    transitionProperty: "color, background-color, border-color",
    transitionDuration: "150ms",
    outline: "none",
    cursor: "pointer",
    ":hover": {
      color: colors.fg,
    },
    ":focus-visible": {
      borderColor: colors.accent,
      boxShadow: "0 0 0 2px color-mix(in oklab, var(--accent) 35%, transparent)",
    },
    ":disabled": {
      pointerEvents: "none",
      opacity: 0.45,
    },
    ":is([data-active])": {
      backgroundColor: colors.accent,
      color: colors.accentFg,
    },
  },
  content: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    fontSize: "0.875rem",
    outline: "none",
  },
})

type ListVariant = "default" | "line"

function Tabs({
  orientation = "horizontal",
  style,
  ...props
}: Omit<TabsPrimitive.Root.Props, "className" | "style"> & {
  style?: stylex.StyleXStyles
}) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      {...props}
      {...stylex.props(styles.root, style)}
    />
  )
}

function TabsList({
  variant = "default",
  style,
  ...props
}: Omit<TabsPrimitive.List.Props, "className" | "style"> & {
  variant?: ListVariant
  style?: stylex.StyleXStyles
}) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      {...props}
      {...stylex.props(styles.list, variant === "line" && styles.listLine, style)}
    />
  )
}

function TabsTrigger({
  style,
  ...props
}: Omit<TabsPrimitive.Tab.Props, "className" | "style"> & {
  style?: stylex.StyleXStyles
}) {
  return (
    <TabsPrimitive.Tab data-slot="tabs-trigger" {...props} {...stylex.props(styles.trigger, style)} />
  )
}

function TabsContent({
  style,
  ...props
}: Omit<TabsPrimitive.Panel.Props, "className" | "style"> & {
  style?: stylex.StyleXStyles
}) {
  return (
    <TabsPrimitive.Panel data-slot="tabs-content" {...props} {...stylex.props(styles.content, style)} />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, styles as tabsStyles }
