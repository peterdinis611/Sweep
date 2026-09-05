"use client"

import type { Rating } from "@/analysis/types"
import { scoreTone } from "@/analysis/pagespeed"
import * as stylex from "@stylexjs/stylex"
import { common } from "@/styles/common.stylex"
import { colors, fonts } from "@/styles/tokens.stylex"

const styles = stylex.create({
  root: {
    position: "relative",
    marginInline: "auto",
    aspectRatio: "1 / 1",
    width: "min(100%, 16.5rem)",
  },
  svg: {
    width: "100%",
    height: "100%",
  },
  arc: {
    transitionProperty: "stroke-dasharray",
    transitionDuration: "700ms",
  },
  center: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  score: {
    marginTop: "0.25rem",
    fontFamily: fonts.display,
    fontSize: "4.4rem",
    lineHeight: 1,
    letterSpacing: "-0.04em",
    fontFeatureSettings: '"tnum"',
  },
  denom: {
    marginTop: "0.25rem",
    fontFamily: fonts.mono,
    fontSize: "0.65rem",
    letterSpacing: "0.18em",
    color: colors.muted,
    textTransform: "uppercase",
  },
  dot: {
    display: "inline-block",
    width: "0.375rem",
    height: "0.375rem",
  },
  good: { backgroundColor: colors.good },
  ni: { backgroundColor: colors.warn },
  poor: { backgroundColor: colors.bad },
})

export function ScoreGauge({ score, label }: { score: number; label: string }) {
  const tone = scoreTone(score)
  const color = tone === "good" ? "var(--good)" : tone === "ni" ? "var(--warn)" : "var(--bad)"
  const r = 88
  const c = 2 * Math.PI * r
  const dash = c * (score / 100)
  const ticks = Array.from({ length: 40 }, (_, i) => i)

  const scoreProps = stylex.props(styles.score)

  return (
    <div {...stylex.props(styles.root)}>
      <svg viewBox="0 0 240 240" {...stylex.props(styles.svg)}>
        {ticks.map((i) => {
          const a = ((i / 40) * 360 - 90) * (Math.PI / 180)
          const major = i % 10 === 0
          const inner = major ? 102 : 106
          const outer = 112
          return (
            <line
              key={i}
              x1={120 + Math.cos(a) * inner}
              y1={120 + Math.sin(a) * inner}
              x2={120 + Math.cos(a) * outer}
              y2={120 + Math.sin(a) * outer}
              stroke="var(--line)"
              strokeWidth={major ? 1.4 : 0.8}
            />
          )
        })}
        <circle cx="120" cy="120" r={r} fill="none" stroke="var(--line)" strokeWidth="7" />
        <circle
          cx="120"
          cy="120"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="butt"
          strokeDasharray={`${dash} ${c - dash}`}
          transform="rotate(-90 120 120)"
          {...stylex.props(styles.arc)}
        />
      </svg>
      <div {...stylex.props(styles.center)}>
        <p {...stylex.props(common.kicker)}>{label}</p>
        <p {...scoreProps} style={{ ...scoreProps.style, color }}>
          {score}
        </p>
        <p {...stylex.props(styles.denom)}>/ 100</p>
      </div>
    </div>
  )
}

export function RatingDot({ rating }: { rating: Rating }) {
  const tone = rating === "good" ? styles.good : rating === "ni" ? styles.ni : styles.poor
  return <i {...stylex.props(styles.dot, tone)} />
}
