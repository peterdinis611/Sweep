import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { common } from "@/styles/common.stylex"
import { colors, fonts } from "@/styles/tokens.stylex"

const arcDraw = stylex.keyframes({
  from: { strokeDashoffset: 40 },
  to: { strokeDashoffset: 0 },
})

const styles = stylex.create({
  section: {
    position: "relative",
    overflow: "hidden",
    paddingBottom: "2rem",
    paddingTop: "2rem",
  },
  watermark: {
    pointerEvents: "none",
    position: "absolute",
    left: "-0.5rem",
    top: 0,
    userSelect: "none",
    fontFamily: fonts.display,
    fontSize: "min(42vw, 14rem)",
    lineHeight: 1,
    color: "color-mix(in oklab, var(--fg) 4%, transparent)",
  },
  grid: {
    position: "relative",
    display: "grid",
    alignItems: "end",
    gap: "3rem",
    "@media (min-width: 1024px)": {
      gridTemplateColumns: "1.15fr 0.85fr",
    },
  },
  title: {
    marginTop: "1.25rem",
    maxWidth: "36rem",
    fontFamily: fonts.display,
    fontSize: "2.6rem",
    fontWeight: 500,
    lineHeight: 0.95,
    letterSpacing: "-0.02em",
    "@media (min-width: 640px)": {
      fontSize: "3rem",
    },
  },
  body: {
    marginTop: "1.25rem",
    maxWidth: "28rem",
    fontSize: "1.05rem",
    lineHeight: 1.625,
    color: colors.muted,
  },
  actions: {
    marginTop: "2rem",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 1,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.line,
  },
  dialWrap: {
    position: "relative",
    marginInline: "auto",
    width: "100%",
    maxWidth: "20rem",
    "@media (min-width: 1024px)": {
      justifySelf: "end",
    },
  },
  plate: {
    position: "relative",
    aspectRatio: "1 / 1",
    padding: "2rem",
  },
  svg: {
    width: "100%",
    height: "100%",
  },
  arc: {
    animationName: arcDraw,
    animationDuration: "0.9s",
    animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    animationFillMode: "both",
    "@media (prefers-reduced-motion: reduce)": {
      animationDuration: "0s",
    },
  },
  center: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  code: {
    marginTop: "0.25rem",
    fontFamily: fonts.display,
    fontSize: "3rem",
    lineHeight: 1,
    fontFeatureSettings: '"tnum"',
  },
  signal: {
    marginTop: "0.5rem",
    fontFamily: fonts.mono,
    fontSize: "0.62rem",
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    color: colors.muted,
  },
  delay70: { animationDelay: "70ms" },
  delay120: { animationDelay: "120ms" },
  delay140: { animationDelay: "140ms" },
  delay210: { animationDelay: "210ms" },
})

export function FaultScreen({
  code,
  kicker,
  title,
  body,
  actions,
  detail,
  tone = "accent",
}: {
  code: string
  kicker: string
  title: ReactNode
  body: string
  actions: ReactNode
  detail?: ReactNode
  tone?: "accent" | "bad"
}) {
  const stroke = tone === "bad" ? "var(--bad)" : "var(--accent)"
  const codeProps = stylex.props(styles.code)
  return (
    <section data-testid="fault-screen" data-code={code} {...stylex.props(styles.section)}>
      <p aria-hidden {...stylex.props(styles.watermark)}>
        {code}
      </p>
      <div {...stylex.props(styles.grid)}>
        <div>
          <p {...stylex.props(common.reveal, common.kicker)}>{kicker}</p>
          <h1 {...stylex.props(styles.title, common.reveal, styles.delay70)}>{title}</h1>
          <p {...stylex.props(styles.body, common.reveal, styles.delay140)}>{body}</p>
          {detail}
          <div {...stylex.props(styles.actions, common.reveal, styles.delay210)}>{actions}</div>
        </div>
        <div {...stylex.props(styles.dialWrap, common.reveal, styles.delay120)}>
          <div {...stylex.props(common.plate, styles.plate)}>
            <svg viewBox="0 0 240 240" {...stylex.props(styles.svg)} aria-hidden>
              <circle cx="120" cy="120" r="92" fill="none" stroke="var(--line)" strokeWidth="7" />
              <circle
                cx="120"
                cy="120"
                r="92"
                fill="none"
                stroke={stroke}
                strokeWidth="7"
                strokeLinecap="butt"
                strokeDasharray="140 578"
                transform="rotate(-118 120 120)"
                {...stylex.props(styles.arc)}
              />
            </svg>
            <div {...stylex.props(styles.center)}>
              <p {...stylex.props(common.kicker)}>odpočet</p>
              <p {...codeProps} style={{ ...codeProps.style, color: stroke }}>
                {code}
              </p>
              <p {...stylex.props(styles.signal)}>signál prerušený</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
