import * as stylex from "@stylexjs/stylex"
import { colors } from "@/styles/tokens.stylex"

const skelSweep = stylex.keyframes({
  from: { backgroundPosition: "200% 0" },
  to: { backgroundPosition: "-200% 0" },
})

const styles = stylex.create({
  root: {
    borderRadius: 3,
    backgroundImage:
      "linear-gradient(90deg, var(--secondary), color-mix(in oklab, var(--line) 55%, var(--card)), var(--secondary))",
    backgroundSize: "200% 100%",
    animationName: skelSweep,
    animationDuration: "1.6s",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
    "@media (prefers-reduced-motion: reduce)": {
      animationDuration: "0s",
      backgroundImage: "linear-gradient(var(--secondary), var(--secondary))",
      backgroundColor: colors.secondary,
    },
  },
})

function Skeleton({
  style,
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style"> & {
  style?: stylex.StyleXStyles
}) {
  return <div data-slot="skeleton" {...props} {...stylex.props(styles.root, style)} />
}

export { Skeleton, styles as skeletonStyles }
