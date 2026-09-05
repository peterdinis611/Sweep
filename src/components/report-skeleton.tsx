"use client"

import * as stylex from "@stylexjs/stylex"
import { useI18n } from "@/i18n/provider"
import { colors, fonts } from "@/styles/tokens.stylex"
import { common } from "@/styles/common.stylex"

const skelSweep = stylex.keyframes({
  from: { backgroundPosition: "120% 0" },
  to: { backgroundPosition: "-120% 0" },
})

const skelFadeIn = stylex.keyframes({
  from: { opacity: 0, transform: "translateY(8px)" },
  to: { opacity: 1, transform: "translateY(0)" },
})

const skelBarGrow = stylex.keyframes({
  from: { transform: "scaleX(0.35)", opacity: 0.35 },
  to: { transform: "scaleX(1)", opacity: 1 },
})

const METRICS = [
  { id: "LCP", hint: "Largest Contentful Paint" },
  { id: "INP", hint: "Interaction to Next Paint" },
  { id: "CLS", hint: "Cumulative Layout Shift" },
  { id: "FCP", hint: "First Contentful Paint" },
  { id: "TTFB", hint: "Time to First Byte" },
] as const

const WATERFALL_WIDTHS = [92, 78, 64, 55, 41, 33]

const styles = stylex.create({
  bone: {
    backgroundImage: "linear-gradient( 105deg, color-mix(in oklab, var(--line) 55%, var(--card)) 0%, color-mix(in oklab, var(--line) 55%, var(--card)) 40%, color-mix(in oklab, var(--accent) 18%, var(--card)) 50%, color-mix(in oklab, var(--line) 55%, var(--card)) 60%, color-mix(in oklab, var(--line) 55%, var(--card)) 100% )",
    backgroundSize: "240% 100%",
    animationName: skelSweep,
    animationDuration: "1.6s",
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
    "@media (prefers-reduced-motion: reduce)": {
      animationDuration: "0s",
    },
  },
  gaugeWrap: {
    position: "relative",
    marginInline: "auto",
    aspectRatio: "1",
    width: "min(100%, 16.5rem)",
  },
  gaugeSvg: {
    width: "100%",
    height: "100%",
  },
  gaugeArc: {
    opacity: 0.45,
  },
  gaugeCenter: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeBone: {
    marginTop: "0.5rem",
    height: "3rem",
    width: "5rem",
  },
  gaugeDenom: {
    marginTop: "0.5rem",
    fontFamily: fonts.mono,
    fontSize: "0.65rem",
    letterSpacing: "0.18em",
    color: colors.muted,
    textTransform: "uppercase",
  },
  root: {
    marginTop: "3rem",
    display: "flex",
    flexDirection: "column",
    gap: "3.5rem",
  },
  masthead: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "1.5rem",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colors.line,
    paddingBottom: "2rem",
  },
  mastLeft: {
    minWidth: 0,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
  },
  hostBone: {
    marginTop: "1rem",
    height: "2rem",
    width: "min(100%, 18rem)",
    "@media (min-width: 640px)": {
      height: "2.25rem",
    },
  },
  metaBone: {
    marginTop: "0.75rem",
    height: "0.625rem",
    width: "10rem",
  },
  tabStrip: {
    display: "flex",
    gap: 1,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.line,
  },
  tabLabel: {
    display: "flex",
    height: "2.25rem",
    alignItems: "center",
    paddingInline: "0.75rem",
    fontFamily: fonts.mono,
    fontSize: "0.62rem",
    letterSpacing: "0.14em",
    color: colors.muted,
    textTransform: "uppercase",
  },
  scoreGrid: {
    display: "grid",
    alignItems: "center",
    gap: "2.5rem",
    "@media (min-width: 1024px)": {
      gridTemplateColumns: "17rem 1fr",
      gap: "3.5rem",
    },
  },
  metrics: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 1,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.line,
    backgroundColor: colors.line,
    "@media (min-width: 640px)": {
      gridTemplateColumns: "repeat(3, 1fr)",
    },
  },
  cell: {
    backgroundColor: colors.card,
    paddingInline: "1rem",
    paddingBlock: "1.25rem",
    animationName: skelFadeIn,
    animationDuration: "0.55s",
    animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    animationFillMode: "both",
    "@media (prefers-reduced-motion: reduce)": {
      animationDuration: "0s",
    },
  },
  metricBone: {
    marginTop: "0.75rem",
    height: "2rem",
    width: "4.5rem",
  },
  hint: {
    marginTop: "0.5rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontFamily: fonts.mono,
    fontSize: "0.62rem",
    letterSpacing: "0.025em",
    color: "color-mix(in oklab, var(--muted) 70%, transparent)",
  },
  transferBoneSm: {
    marginTop: "0.5rem",
    height: "0.5rem",
    width: "5rem",
  },
  sectionHead: {
    marginBottom: "1rem",
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: "1rem",
  },
  sectionHint: {
    marginTop: "0.5rem",
    fontSize: "0.875rem",
    color: colors.muted,
  },
  headBone: {
    height: "0.5rem",
    width: "4rem",
  },
  waterfallBox: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.line,
    backgroundColor: colors.card,
    paddingInline: "1rem",
    paddingBlock: "1.25rem",
    "@media (min-width: 640px)": {
      paddingInline: "1.25rem",
    },
  },
  waterfallRows: {
    display: "flex",
    flexDirection: "column",
    gap: "0.875rem",
  },
  waterfallRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  labelBone: {
    height: "0.5rem",
    width: "4rem",
    flexShrink: 0,
    "@media (min-width: 640px)": {
      width: "6rem",
    },
  },
  barTrack: {
    position: "relative",
    height: "0.625rem",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    overflow: "hidden",
    backgroundColor: "color-mix(in oklab, var(--line) 60%, transparent)",
  },
  barFill: {
    position: "absolute",
    insetBlock: 0,
    left: 0,
    backgroundColor: "color-mix(in oklab, var(--accent) 35%, transparent)",
    transformOrigin: "left center",
    animationName: skelBarGrow,
    animationDuration: "0.9s",
    animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    animationFillMode: "both",
    "@media (prefers-reduced-motion: reduce)": {
      animationDuration: "0s",
    },
  },
  msBone: {
    height: "0.5rem",
    width: "2rem",
    flexShrink: 0,
  },
  insightsGrid: {
    display: "grid",
    gap: "2rem",
    "@media (min-width: 1024px)": {
      gridTemplateColumns: "1fr 1fr",
    },
  },
  list: {
    marginTop: "1rem",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  listRow: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    paddingInline: "1rem",
    paddingBlock: "1rem",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colors.line,
    ":last-child": {
      borderBottomWidth: 0,
    },
  },
  dotBone: {
    width: "0.5rem",
    height: "0.5rem",
    flexShrink: 0,
  },
  checkBone: {
    width: "1rem",
    height: "1rem",
    flexShrink: 0,
  },
  listText: {
    minWidth: 0,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  lineBone: {
    height: "0.75rem",
  },
  lineBoneSm: {
    height: "0.5rem",
  },
})

function Bone({
  style: boneStyle,
  delay,
  width,
}: {
  style?: stylex.StyleXStyles
  delay?: number
  width?: string | number
}) {
  const sx = stylex.props(styles.bone, boneStyle)
  return (
    <div
      {...sx}
      style={{
        ...(sx.style as React.CSSProperties | undefined),
        width,
        animationDelay: delay != null ? `${delay}ms` : undefined,
      }}
    />
  )
}

function GaugePreview() {
  const { t } = useI18n()
  const ticks = Array.from({ length: 40 }, (_, i) => i)
  const r = 88
  const c = 2 * Math.PI * r

  return (
    <div {...stylex.props(styles.gaugeWrap)}>
      <svg viewBox="0 0 240 240" {...stylex.props(styles.gaugeSvg)} aria-hidden>
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
          stroke="var(--accent)"
          strokeWidth="7"
          strokeLinecap="butt"
          strokeDasharray={`${c * 0.28} ${c}`}
          transform="rotate(-90 120 120)"
          {...stylex.props(styles.gaugeArc)}
        />
      </svg>
      <div {...stylex.props(styles.gaugeCenter)}>
        <p {...stylex.props(common.kicker)}>{t.report.mobile.toLowerCase()}</p>
        <Bone style={styles.gaugeBone} delay={80} />
        <p {...stylex.props(styles.gaugeDenom)}>/ 100</p>
      </div>
    </div>
  )
}

function TransferCell() {
  const { t } = useI18n()
  const cellSx = stylex.props(styles.cell)
  return (
    <article
      {...cellSx}
      style={{
        ...(cellSx.style as React.CSSProperties | undefined),
        animationDelay: "350ms",
      }}
    >
      <p {...stylex.props(common.kicker)}>{t.report.transfer}</p>
      <Bone style={styles.metricBone} delay={400} />
      <Bone style={styles.transferBoneSm} delay={440} />
    </article>
  )
}

export function ReportSkeleton() {
  const { t } = useI18n()
  return (
    <div {...stylex.props(styles.root, common.noPrint)} aria-hidden>
      <div {...stylex.props(styles.masthead)}>
        <div {...stylex.props(styles.mastLeft)}>
          <p {...stylex.props(common.kicker)}>{t.report.dossier}</p>
          <Bone style={styles.hostBone} delay={40} />
          <Bone style={styles.metaBone} delay={120} />
        </div>
        <div {...stylex.props(styles.tabStrip)}>
          {[t.report.mobile, t.report.desktop, "CSV"].map((label, i) => {
            const tabSx = stylex.props(styles.tabLabel)
            return (
              <div
                key={label}
                {...tabSx}
                style={{
                  ...(tabSx.style as React.CSSProperties | undefined),
                  opacity: 0.45 + i * 0.08,
                }}
              >
                {label}
              </div>
            )
          })}
        </div>
      </div>

      <div {...stylex.props(styles.scoreGrid)}>
        <GaugePreview />
        <div {...stylex.props(styles.metrics)}>
          {METRICS.map((m, i) => {
            const cellSx = stylex.props(styles.cell)
            return (
              <article
                key={m.id}
                {...cellSx}
                style={{
                  ...(cellSx.style as React.CSSProperties | undefined),
                  animationDelay: `${i * 70}ms`,
                }}
              >
                <p {...stylex.props(common.kicker)}>{m.id}</p>
                <Bone style={styles.metricBone} delay={100 + i * 60} />
                <p {...stylex.props(styles.hint)}>{m.hint}</p>
              </article>
            )
          })}
          <TransferCell />
        </div>
      </div>

      <section>
        <div {...stylex.props(styles.sectionHead)}>
          <div>
            <p {...stylex.props(common.kicker)}>{t.skeleton.waterfall}</p>
            <p {...stylex.props(styles.sectionHint)}>{t.skeleton.waterfallHint}</p>
          </div>
          <Bone style={styles.headBone} delay={200} />
        </div>
        <div {...stylex.props(styles.waterfallBox)}>
          <div {...stylex.props(styles.waterfallRows)}>
            {WATERFALL_WIDTHS.map((w, i) => {
              const barSx = stylex.props(styles.barFill)
              return (
                <div key={w} {...stylex.props(styles.waterfallRow)}>
                  <Bone style={styles.labelBone} delay={180 + i * 50} />
                  <div {...stylex.props(styles.barTrack)}>
                    <div
                      {...barSx}
                      style={{
                        ...(barSx.style as React.CSSProperties | undefined),
                        width: `${w}%`,
                        animationDelay: `${220 + i * 70}ms`,
                      }}
                    />
                  </div>
                  <Bone style={styles.msBone} delay={200 + i * 50} />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <div {...stylex.props(styles.insightsGrid)}>
        <section>
          <p {...stylex.props(common.kicker)}>{t.skeleton.improve}</p>
          <div {...stylex.props(styles.list)}>
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} {...stylex.props(styles.listRow)}>
                <Bone style={styles.dotBone} delay={260 + i * 80} />
                <div {...stylex.props(styles.listText)}>
                  <Bone style={styles.lineBone} width="min(100%, 70%)" delay={280 + i * 80} />
                  <Bone style={styles.lineBoneSm} width="min(100%, 42%)" delay={320 + i * 80} />
                </div>
              </div>
            ))}
          </div>
        </section>
        <section>
          <p {...stylex.props(common.kicker)}>{t.skeleton.good}</p>
          <div {...stylex.props(styles.list)}>
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} {...stylex.props(styles.listRow)}>
                <Bone style={styles.checkBone} delay={300 + i * 80} />
                <div {...stylex.props(styles.listText)}>
                  <Bone style={styles.lineBone} width="min(100%, 60%)" delay={320 + i * 80} />
                  <Bone style={styles.lineBoneSm} width="min(100%, 80%)" delay={360 + i * 80} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
