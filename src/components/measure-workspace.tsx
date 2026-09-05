"use client"

import { useEffect, useState } from "react"
import { ArrowRight, LoaderCircle } from "lucide-react"
import { usePathname } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import * as stylex from "@stylexjs/stylex"
import { analyzeSite, loadDemo } from "@/app/actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button, buttonStyles } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/i18n/provider"
import type { Messages } from "@/i18n/messages"
import { colors, fonts } from "@/styles/tokens.stylex"
import { common } from "@/styles/common.stylex"
import { LabProgress } from "./lab-progress"

const spin = stylex.keyframes({
  from: { transform: "rotate(0deg)" },
  to: { transform: "rotate(360deg)" },
})

type ProgressLabelKey = keyof Messages["progress"]["labels"]

function firstValidationMessage(errors: unknown): string | null {
  if (!errors || typeof errors !== "object") return null
  const rec = errors as Record<string, unknown>
  const url = rec.url
  if (typeof url === "string") return url
  if (Array.isArray(url) && typeof url[0] === "string") return url[0]
  if (url && typeof url === "object") {
    const nested = url as { _errors?: unknown }
    if (Array.isArray(nested._errors) && typeof nested._errors[0] === "string") {
      return nested._errors[0]
    }
  }
  const formErrors = rec.formErrors
  if (Array.isArray(formErrors) && typeof formErrors[0] === "string") return formErrors[0]
  return null
}

function useSimulatedProgress(active: boolean) {
  const [pct, setPct] = useState(0)
  const [labelKey, setLabelKey] = useState<ProgressLabelKey | "">("")
  const [elapsedSec, setElapsedSec] = useState(0)

  useEffect(() => {
    if (!active) {
      setPct(0)
      setLabelKey("")
      setElapsedSec(0)
      return
    }
    const started = Date.now()
    const steps: { at: number; pct: number; labelKey: ProgressLabelKey }[] = [
      { at: 0, pct: 6, labelKey: "verify" },
      { at: 700, pct: 14, labelKey: "mobile" },
      { at: 8500, pct: 46, labelKey: "desktop" },
      { at: 21000, pct: 72, labelKey: "report" },
      { at: 36000, pct: 88, labelKey: "wait" },
      { at: 52000, pct: 94, labelKey: "polish" },
    ]
    const timers = steps.map((s) =>
      setTimeout(() => {
        setPct(s.pct)
        setLabelKey(s.labelKey)
      }, s.at),
    )
    const tick = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - started) / 1000))
      setPct((p) => (p < 96 ? Math.min(96, p + 0.28) : p))
    }, 800)
    return () => {
      timers.forEach(clearTimeout)
      clearInterval(tick)
    }
  }, [active])

  return { pct, labelKey, elapsedSec }
}

const styles = stylex.create({
  heroSection: {
    position: "relative",
    marginBottom: "4rem",
    display: "grid",
    alignItems: "end",
    gap: "3rem",
    paddingTop: "2.5rem",
    "@media (min-width: 1024px)": {
      gridTemplateColumns: "1.05fr 0.95fr",
      gap: "4rem",
    },
  },
  compactSection: {
    marginBottom: "2.5rem",
    paddingTop: "1.5rem",
  },
  formKicker: {
    marginBottom: "0.75rem",
  },
  formReveal: {
    animationDelay: "200ms",
  },
  row: {
    display: "flex",
    flexDirection: "column",
    "@media (min-width: 640px)": {
      flexDirection: "row",
      alignItems: "stretch",
    },
  },
  input: {
    height: "3.5rem",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    borderRadius: 0,
    borderWidth: 0,
    paddingInline: "1rem",
    fontSize: "0.95rem",
    ":focus-visible": {
      boxShadow: "0 0 0 0 transparent",
    },
  },
  actions: {
    display: "flex",
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: colors.line,
    "@media (min-width: 640px)": {
      borderTopWidth: 0,
      borderLeftWidth: 1,
      borderLeftStyle: "solid",
      borderLeftColor: colors.line,
    },
  },
  spinIcon: {
    display: "inline-flex",
    animationName: spin,
    animationDuration: "1s",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
    "@media (prefers-reduced-motion: reduce)": {
      animationDuration: "0s",
      animationIterationCount: 1,
    },
  },
  demoBtn: {
    minWidth: "6.5rem",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    borderRadius: 0,
    borderWidth: 0,
    borderRightWidth: 1,
    borderRightStyle: "solid",
    borderRightColor: colors.line,
    "@media (min-width: 640px)": {
      flexGrow: 0,
      flexShrink: 0,
      flexBasis: "auto",
    },
  },
  submitBtn: {
    minWidth: "8.5rem",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    borderRadius: 0,
    "@media (min-width: 640px)": {
      flexGrow: 0,
      flexShrink: 0,
      flexBasis: "auto",
    },
  },
  arrowIcon: {
    display: "inline-flex",
    opacity: 0.8,
  },
  errorAlert: {
    marginTop: "0.75rem",
  },
  errorTitle: {
    color: colors.bad,
  },
  errorBody: {
    marginTop: "0.375rem",
    fontFamily: fonts.body,
    fontSize: "0.88rem",
    lineHeight: 1.625,
    color: colors.bad,
  },
  hint: {
    marginTop: "0.75rem",
    fontFamily: fonts.mono,
    fontSize: "0.68rem",
    lineHeight: 1.625,
    letterSpacing: "0.025em",
    color: colors.muted,
  },
  alertDesc: {
    textTransform: "none",
    letterSpacing: "normal",
  },
})

export function MeasureWorkspace({
  hero,
  children,
  initialUrl = "",
}: {
  hero?: React.ReactNode
  children?: React.ReactNode
  initialUrl?: string
}) {
  const pathname = usePathname()
  const { t } = useI18n()
  const [url, setUrl] = useState(initialUrl)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setUrl(initialUrl)
    setError(null)
  }, [pathname, initialUrl])

  const analyze = useAction(analyzeSite, {
    onExecute: () => setError(null),
    onError: ({ error: err }) => {
      setError(err.serverError ?? firstValidationMessage(err.validationErrors) ?? t.form.failAnalyze)
    },
  })

  const demo = useAction(loadDemo, {
    onExecute: () => setError(null),
    onError: ({ error: err }) => {
      setError(err.serverError ?? t.form.failDemo)
    },
  })

  const busy = analyze.isPending || demo.isPending
  const progress = useSimulatedProgress(busy)
  const showHero = Boolean(hero) && !busy

  return (
    <div key={pathname}>
      {showHero ? (
        <section {...stylex.props(styles.heroSection, common.noPrint)}>
          {hero}
          <SearchForm
            url={url}
            setUrl={setUrl}
            busy={busy}
            error={error}
            onSubmit={() => analyze.execute({ url })}
            onDemo={() => demo.execute({ variant: "mid" })}
            onDemoPoor={() => demo.execute({ variant: "poor" })}
          />
        </section>
      ) : (
        <section {...stylex.props(styles.compactSection, common.noPrint)}>
          <SearchForm
            compact
            url={url}
            setUrl={setUrl}
            busy={busy}
            error={error}
            onSubmit={() => analyze.execute({ url })}
            onDemo={() => demo.execute({ variant: "mid" })}
            onDemoPoor={() => demo.execute({ variant: "poor" })}
          />
        </section>
      )}

      {busy && (
        <LabProgress
          pct={progress.pct}
          labelKey={progress.labelKey}
          url={url}
          elapsedSec={progress.elapsedSec}
        />
      )}
      {!busy && children}
    </div>
  )
}

function SearchForm({
  url,
  setUrl,
  busy,
  error,
  onSubmit,
  onDemo,
  onDemoPoor,
  compact,
}: {
  url: string
  setUrl: (v: string) => void
  busy: boolean
  error: string | null
  onSubmit: () => void
  onDemo: () => void
  onDemoPoor: () => void
  compact?: boolean
}) {
  const { t } = useI18n()
  return (
    <div data-testid="measure-form" {...(compact ? {} : stylex.props(common.reveal, styles.formReveal))}>
      {!compact && <p {...stylex.props(common.kicker, styles.formKicker)}>{t.form.kicker}</p>}
      <form
        {...stylex.props(common.plate)}
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
      >
        <Label {...stylex.props(common.srOnly)} htmlFor="sweep-url">
          {t.form.urlLabel}
        </Label>
        <div {...stylex.props(styles.row)}>
          <Input
            id="sweep-url"
            data-testid="url-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t.form.placeholder}
            {...stylex.props(styles.input)}
            inputMode="url"
            autoCapitalize="off"
            spellCheck={false}
            disabled={busy}
          />
          <div {...stylex.props(styles.actions)}>
            <Button
              type="button"
              variant="outline"
              size="lg"
              data-testid="demo-button"
              disabled={busy}
              onClick={onDemo}
              style={[buttonStyles.roundedNone, styles.demoBtn]}
            >
              {t.form.demo}
            </Button>
            <Button
              type="submit"
              size="lg"
              data-testid="analyze-button"
              disabled={busy}
              style={[buttonStyles.roundedNone, styles.submitBtn]}
            >
              {busy ? (
                <>
                  <span {...stylex.props(styles.spinIcon)}>
                    <LoaderCircle size={14} strokeWidth={2.25} />
                  </span>
                  {t.form.measuring}
                </>
              ) : (
                <>
                  {t.form.analyze}
                  <span {...stylex.props(styles.arrowIcon)}>
                    <ArrowRight size={14} strokeWidth={2.25} />
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
      {error && (
        <div {...stylex.props(styles.errorAlert)} data-testid="form-error">
          <Alert variant="destructive">
            <AlertDescription {...stylex.props(styles.alertDesc)}>
              <span {...stylex.props(common.kicker, styles.errorTitle)}>{t.form.errorTitle}</span>
              <p {...stylex.props(styles.errorBody)}>{error}</p>
            </AlertDescription>
          </Alert>
        </div>
      )}
      {!compact && (
        <p {...stylex.props(styles.hint)}>
          {t.form.hint}
          {" · "}
          <button
            type="button"
            data-testid="demo-poor-button"
            disabled={busy}
            onClick={onDemoPoor}
            style={{
              background: "none",
              border: 0,
              padding: 0,
              color: "inherit",
              font: "inherit",
              letterSpacing: "inherit",
              cursor: busy ? "default" : "pointer",
              textDecoration: "underline",
              textUnderlineOffset: "0.2em",
            }}
          >
            {t.form.demoPoor}
          </button>
        </p>
      )}
    </div>
  )
}
