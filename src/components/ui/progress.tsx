"use client"

import { Progress as ProgressPrimitive } from "@base-ui/react/progress"
import * as stylex from "@stylexjs/stylex"
import { colors, fonts } from "@/styles/tokens.stylex"

const styles = stylex.create({
  root: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
  },
  track: {
    position: "relative",
    display: "flex",
    height: 1,
    width: "100%",
    alignItems: "center",
    overflowX: "hidden",
    backgroundColor: colors.line,
  },
  indicator: {
    height: "100%",
    backgroundColor: colors.accent,
    transitionProperty: "all",
    transitionDuration: "150ms",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: 500,
    fontFamily: fonts.body,
  },
  value: {
    marginLeft: "auto",
    fontSize: "0.875rem",
    color: colors.muted,
    fontFeatureSettings: '"tnum"',
  },
})

function Progress({
  children,
  value,
  style,
  ...props
}: Omit<ProgressPrimitive.Root.Props, "className" | "style"> & {
  style?: stylex.StyleXStyles
}) {
  return (
    <ProgressPrimitive.Root
      value={value}
      data-slot="progress"
      {...props}
      {...stylex.props(styles.root, style)}
    >
      {children}
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  )
}

function ProgressTrack({
  style,
  ...props
}: Omit<ProgressPrimitive.Track.Props, "className" | "style"> & {
  style?: stylex.StyleXStyles
}) {
  return (
    <ProgressPrimitive.Track
      data-slot="progress-track"
      {...props}
      {...stylex.props(styles.track, style)}
    />
  )
}

function ProgressIndicator({
  style,
  ...props
}: Omit<ProgressPrimitive.Indicator.Props, "className" | "style"> & {
  style?: stylex.StyleXStyles
}) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      {...props}
      {...stylex.props(styles.indicator, style)}
    />
  )
}

function ProgressLabel({
  style,
  ...props
}: Omit<ProgressPrimitive.Label.Props, "className" | "style"> & {
  style?: stylex.StyleXStyles
}) {
  return (
    <ProgressPrimitive.Label data-slot="progress-label" {...props} {...stylex.props(styles.label, style)} />
  )
}

function ProgressValue({
  style,
  ...props
}: Omit<ProgressPrimitive.Value.Props, "className" | "style"> & {
  style?: stylex.StyleXStyles
}) {
  return (
    <ProgressPrimitive.Value data-slot="progress-value" {...props} {...stylex.props(styles.value, style)} />
  )
}

export { Progress, ProgressTrack, ProgressIndicator, ProgressLabel, ProgressValue }
