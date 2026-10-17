"use client"

import type { Rating } from "@/analysis/types"
import { scoreTone } from "@/analysis/pagespeed"
import * as stylex from "@stylexjs/stylex"
import { colors, fonts } from "@/styles/tokens.stylex"

const rise = stylex.keyframes({
  from: { opacity: 0, transform: "scale(0.96)" },
  to: { opacity: 1, transform: "scale(1)" },
})

const styles = stylex.create({
  root: {
    position: "relative",
    marginInline: "auto",
    aspectRatio: "1 / 1",
    width: "min(100%, 13.5rem)",
    animationName: rise,
    animationDuration: "0.7s",
    animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    animationFillMode: "both",
    "@media (min-width: 640px)": {
      width: "min(100%, 16.5rem)",
    },
  },
  svg: {
    width: "100%",
    height: "100%",
    display: "block",
  },
  arc: {
    transitionProperty: "stroke-dasharray, stroke",
    transitionDuration: "900ms",
    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
  },
  label: {
    fill: "var(--muted)",
    fontFamily: fonts.mono,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: 3.2,
    textTransform: "uppercase",
  },
  score: {
    fontFamily: fonts.display,
    fontSize: 78,
    fontWeight: 500,
    letterSpacing: -2.5,
    fontFeatureSettings: '"tnum"',
  },
  denom: {
    fill: "var(--muted)",
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },
  dot: {
    display: "inline-block",
    width: "0.4rem",
    height: "0.4rem",
    flexShrink: 0,
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

  return (
    <div data-testid="score-gauge" data-score={score} {...stylex.props(styles.root)}>
      <svg viewBox="0 0 240 240" {...stylex.props(styles.svg)} role="img" aria-label={`${label} ${score} / 100`}>
        {ticks.map((i) => {
          const a = ((i / 40) * 360 - 90) * (Math.PI / 180)
          const major = i % 10 === 0
          const inner = major ? 101 : 106
          const outer = 112
          return (
            <line
              key={i}
              x1={120 + Math.cos(a) * inner}
              y1={120 + Math.sin(a) * inner}
              x2={120 + Math.cos(a) * outer}
              y2={120 + Math.sin(a) * outer}
              stroke="var(--line)"
              strokeWidth={major ? 1.5 : 0.75}
              opacity={major ? 0.9 : 0.55}
            />
          )
        })}
        <circle
          cx="120"
          cy="120"
          r={r}
          fill="none"
          stroke="var(--line)"
          strokeWidth="8"
          opacity={0.55}
        />
        <circle
          cx="120"
          cy="120"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="butt"
          strokeDasharray={`${dash} ${c - dash}`}
          transform="rotate(-90 120 120)"
          {...stylex.props(styles.arc)}
        />
        <text
          x="120"
          y="78"
          textAnchor="middle"
          dominantBaseline="central"
          {...stylex.props(styles.label)}
        >
          {label}
        </text>
        <text
          x="120"
          y="124"
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          {...stylex.props(styles.score)}
        >
          {score}
        </text>
        <text
          x="120"
          y="168"
          textAnchor="middle"
          dominantBaseline="central"
          {...stylex.props(styles.denom)}
        >
          / 100
        </text>
      </svg>
    </div>
  )
}

export function RatingDot({ rating }: { rating: Rating }) {
  const tone = rating === "good" ? styles.good : rating === "ni" ? styles.ni : styles.poor
  return <i {...stylex.props(styles.dot, tone)} />
}
