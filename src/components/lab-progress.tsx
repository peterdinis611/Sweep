"use client"

import { useEffect, useState } from "react"
import { Check, LoaderCircle } from "lucide-react"
import * as stylex from "@stylexjs/stylex"
import { ReportSkeleton } from "./report-skeleton"
import { useI18n } from "@/i18n/provider"
import type { Messages } from "@/i18n/messages"
import { colors, fonts } from "@/styles/tokens.stylex"
import { common } from "@/styles/common.stylex"

const labBreathe = stylex.keyframes({
  "0%": { opacity: 1 },
  "50%": { opacity: 0.72 },
  "100%": { opacity: 1 },
})

const labTipIn = stylex.keyframes({
  from: { opacity: 0, transform: "translateY(6px)" },
  to: { opacity: 1, transform: "translateY(0)" },
})

const labBarSheen = stylex.keyframes({
  from: { backgroundPosition: "200% 0" },
  to: { backgroundPosition: "-200% 0" },
})

const spin = stylex.keyframes({
  from: { transform: "rotate(0deg)" },
  to: { transform: "rotate(360deg)" },
})

type ProgressLabelKey = keyof Messages["progress"]["labels"]

function activeStepIndex(pct: number) {
  if (pct < 18) return 0
  if (pct < 52) return 1
  if (pct < 82) return 2
  return 3
}

function formatElapsed(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `0:${String(s).padStart(2, "0")}`
}

function hostLabel(url: string, fallback: string) {
  try {
    return new URL(url.includes("://") ? url : `https://${url}`).hostname
  } catch {
    return url || fallback
  }
}

const styles = stylex.create({
  root: {
    marginBottom: "4rem",
  },
  wait: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.line,
    backgroundColor: colors.card,
    animationName: labBreathe,
    animationDuration: "3.2s",
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
    "@media (prefers-reduced-motion: reduce)": {
      animationDuration: "0s",
    },
  },
  body: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
    paddingInline: "1.25rem",
    paddingBlock: "1.5rem",
    "@media (min-width: 640px)": {
      paddingInline: "1.75rem",
      paddingBlock: "2rem",
    },
    "@media (min-width: 1024px)": {
      flexDirection: "row",
      alignItems: "stretch",
      gap: "2.5rem",
    },
  },
  dialWrap: {
    position: "relative",
    marginInline: "auto",
    width: "min(100%, 11.5rem)",
    flexShrink: 0,
    "@media (min-width: 1024px)": {
      marginInline: 0,
    },
  },
  dialSvg: {
    width: "100%",
    height: "100%",
  },
  dialArc: {
    transitionProperty: "stroke-dashoffset",
    transitionDuration: "700ms",
    transitionTimingFunction: "ease-out",
  },
  dialCenter: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  dialKicker: {
    letterSpacing: "0.2em",
  },
  dialPct: {
    marginTop: "0.25rem",
    fontFamily: fonts.display,
    fontSize: "2.75rem",
    lineHeight: 1,
    fontFeatureSettings: '"tnum"',
    letterSpacing: "-0.025em",
    color: colors.accent,
  },
  dialPctUnit: {
    marginLeft: "0.125rem",
    fontSize: "1.1rem",
    color: colors.muted,
  },
  main: {
    minWidth: 0,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
  },
  header: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "1rem",
  },
  headerLeft: {
    minWidth: 0,
  },
  title: {
    marginTop: "0.5rem",
    fontFamily: fonts.display,
    fontSize: "1.65rem",
    lineHeight: 1.25,
    letterSpacing: "-0.025em",
    "@media (min-width: 640px)": {
      fontSize: "1.85rem",
    },
  },
  host: {
    marginTop: "0.5rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontFamily: fonts.mono,
    fontSize: "0.78rem",
    letterSpacing: "0.025em",
    color: colors.muted,
  },
  headerRight: {
    textAlign: "right",
  },
  elapsedValue: {
    marginTop: "0.25rem",
    fontFamily: fonts.mono,
    fontSize: "1.125rem",
    fontFeatureSettings: '"tnum"',
    letterSpacing: "-0.025em",
  },
  eta: {
    marginTop: "0.25rem",
    fontSize: "0.72rem",
    color: colors.muted,
  },
  barTrack: {
    marginTop: "1.5rem",
    height: 3,
    overflow: "hidden",
    backgroundColor: colors.line,
  },
  barFill: {
    height: "100%",
    backgroundColor: colors.accent,
    backgroundImage: "linear-gradient(90deg, transparent, color-mix(in oklab, var(--accent-fg) 35%, transparent), transparent)",
    backgroundSize: "200% 100%",
    transitionProperty: "width",
    transitionDuration: "700ms",
    transitionTimingFunction: "ease-out",
    animationName: labBarSheen,
    animationDuration: "2.4s",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
    "@media (prefers-reduced-motion: reduce)": {
      animationDuration: "0s",
    },
  },
  steps: {
    marginTop: "1.75rem",
    marginInline: 0,
    marginBottom: 0,
    display: "grid",
    gap: "0.75rem",
    listStyleType: "none",
    padding: 0,
    "@media (min-width: 640px)": {
      gridTemplateColumns: "1fr 1fr",
    },
    "@media (min-width: 1024px)": {
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "1rem",
    },
  },
  step: {
    position: "relative",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "transparent",
    paddingInline: 0,
    paddingBlock: "0.25rem",
    transitionProperty: "background-color, border-color, padding",
    transitionDuration: "150ms",
  },
  stepCurrent: {
    borderColor: colors.line,
    backgroundColor: "color-mix(in oklab, var(--accent) 6%, var(--card))",
    paddingInline: "0.75rem",
    paddingBlock: "0.625rem",
  },
  stepRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  stepBadge: {
    display: "inline-flex",
    width: "1.25rem",
    height: "1.25rem",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "solid",
    fontSize: "0.58rem",
    fontFamily: fonts.mono,
  },
  stepBadgeDone: {
    borderColor: colors.good,
    backgroundColor: colors.good,
    color: "#fff",
  },
  stepBadgeCurrent: {
    borderColor: colors.accent,
    color: colors.accent,
  },
  stepBadgeIdle: {
    borderColor: colors.line,
    color: colors.muted,
  },
  stepTitle: {
    fontSize: "0.82rem",
    fontWeight: 500,
    lineHeight: 1.375,
  },
  stepTitleActive: {
    color: colors.fg,
  },
  stepTitleIdle: {
    color: colors.muted,
  },
  stepDetail: {
    marginTop: "0.375rem",
    paddingLeft: "1.75rem",
    fontSize: "0.7rem",
    lineHeight: 1.375,
  },
  stepDetailCurrent: {
    color: colors.muted,
  },
  stepDetailIdle: {
    color: "color-mix(in oklab, var(--muted) 50%, transparent)",
  },
  spinIcon: {
    display: "inline-flex",
    animationName: spin,
    animationDuration: "1s",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
    "@media (prefers-reduced-motion: reduce)": {
      animationDuration: "0s",
    },
  },
  tipBar: {
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: colors.line,
    paddingInline: "1.25rem",
    paddingBlock: "1rem",
    "@media (min-width: 640px)": {
      paddingInline: "1.75rem",
    },
  },
  tip: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    animationName: labTipIn,
    animationDuration: "0.45s",
    animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    animationFillMode: "both",
    "@media (min-width: 640px)": {
      flexDirection: "row",
      alignItems: "baseline",
      gap: "1rem",
    },
    "@media (prefers-reduced-motion: reduce)": {
      animationDuration: "0s",
    },
  },
  tipKicker: {
    flexShrink: 0,
    color: colors.accent,
  },
  tipBody: {
    fontSize: "0.88rem",
    lineHeight: 1.625,
    color: colors.muted,
  },
})

export function LabProgress({
  pct,
  labelKey = "",
  url = "",
  elapsedSec = 0,
}: {
  pct: number
  labelKey?: ProgressLabelKey | ""
  url?: string
  elapsedSec?: number
}) {
  const { t } = useI18n()
  const active = activeStepIndex(pct)
  const displayPct = Math.min(99, Math.round(pct))
  const host = hostLabel(url, t.progress.hostFallback)
  const [tipIndex, setTipIndex] = useState(0)
  const steps = t.progress.steps
  const tips = t.progress.tips

  useEffect(() => {
    const id = setInterval(() => {
      setTipIndex((i) => (i + 1) % tips.length)
    }, 6500)
    return () => clearInterval(id)
  }, [tips.length])

  const tip = tips[tipIndex]!
  const label = labelKey ? t.progress.labels[labelKey] : t.progress.preparing
  const etaHint =
    elapsedSec < 12
      ? t.progress.etaEarly
      : elapsedSec < 28
        ? t.progress.etaMid
        : elapsedSec < 45
          ? t.progress.etaLate
          : t.progress.etaLong

  const barFillSx = stylex.props(styles.barFill)

  return (
    <div {...stylex.props(styles.root, common.noPrint)} role="status" aria-live="polite" aria-busy="true">
      <div {...stylex.props(styles.wait)}>
        <div {...stylex.props(styles.body)}>
          <div {...stylex.props(styles.dialWrap)}>
            <svg viewBox="0 0 160 160" {...stylex.props(styles.dialSvg)} aria-hidden>
              <circle
                cx="80"
                cy="80"
                r="68"
                fill="none"
                stroke="var(--line)"
                strokeWidth="1"
                strokeDasharray="2 4"
              />
              <circle cx="80" cy="80" r="58" fill="none" stroke="var(--line)" strokeWidth="6" />
              <circle
                cx="80"
                cy="80"
                r="58"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 58}`}
                strokeDashoffset={`${2 * Math.PI * 58 * (1 - displayPct / 100)}`}
                {...stylex.props(styles.dialArc)}
                transform="rotate(-90 80 80)"
              />
            </svg>
            <div {...stylex.props(styles.dialCenter)}>
              <span {...stylex.props(common.kicker, styles.dialKicker)}>{t.progress.done}</span>
              <span {...stylex.props(styles.dialPct)}>
                {displayPct}
                <span {...stylex.props(styles.dialPctUnit)}>%</span>
              </span>
            </div>
          </div>

          <div {...stylex.props(styles.main)}>
            <div {...stylex.props(styles.header)}>
              <div {...stylex.props(styles.headerLeft)}>
                <p {...stylex.props(common.kicker)}>{t.progress.labRunning}</p>
                <h2 {...stylex.props(styles.title)}>{label}</h2>
                <p {...stylex.props(styles.host)} title={url}>
                  {host}
                </p>
              </div>
              <div {...stylex.props(styles.headerRight)}>
                <p {...stylex.props(common.kicker)}>{t.progress.elapsed}</p>
                <p {...stylex.props(styles.elapsedValue)}>{formatElapsed(elapsedSec)}</p>
                <p {...stylex.props(styles.eta)}>{etaHint}</p>
              </div>
            </div>

            <div {...stylex.props(styles.barTrack)}>
              <div
                {...barFillSx}
                style={{
                  ...(barFillSx.style as React.CSSProperties | undefined),
                  width: `${displayPct}%`,
                }}
              />
            </div>

            <ol {...stylex.props(styles.steps)}>
              {steps.map((step, i) => {
                const done = i < active
                const current = i === active
                return (
                  <li key={step.title} {...stylex.props(styles.step, current && styles.stepCurrent)}>
                    <div {...stylex.props(styles.stepRow)}>
                      <span
                        {...stylex.props(
                          styles.stepBadge,
                          done && styles.stepBadgeDone,
                          current && styles.stepBadgeCurrent,
                          !done && !current && styles.stepBadgeIdle,
                        )}
                      >
                        {done ? (
                          <Check size={12} strokeWidth={2.5} />
                        ) : current ? (
                          <span {...stylex.props(styles.spinIcon)}>
                            <LoaderCircle size={12} strokeWidth={2.25} />
                          </span>
                        ) : (
                          String(i + 1).padStart(2, "0")
                        )}
                      </span>
                      <span
                        {...stylex.props(
                          styles.stepTitle,
                          current || done ? styles.stepTitleActive : styles.stepTitleIdle,
                        )}
                      >
                        {step.title}
                      </span>
                    </div>
                    <p
                      {...stylex.props(
                        styles.stepDetail,
                        current ? styles.stepDetailCurrent : styles.stepDetailIdle,
                      )}
                    >
                      {step.detail}
                    </p>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>

        <div {...stylex.props(styles.tipBar)}>
          <div key={`${tipIndex}-${tip.kicker}`} {...stylex.props(styles.tip)}>
            <span {...stylex.props(common.kicker, styles.tipKicker)}>{tip.kicker}</span>
            <p {...stylex.props(styles.tipBody)}>{tip.body}</p>
          </div>
        </div>
      </div>

      <ReportSkeleton />
    </div>
  )
}
