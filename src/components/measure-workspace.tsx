"use client"

import { useEffect, useState } from "react"
import { ArrowRight, LoaderCircle } from "lucide-react"
import { usePathname } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import * as stylex from "@stylexjs/stylex"
import { analyzeSite, analyzeSitemap, loadDemo } from "@/app/actions"
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
    gap: "2.75rem",
    paddingTop: "1.75rem",
    "@media (min-width: 1024px)": {
      gridTemplateColumns: "1.05fr 0.95fr",
      gap: "3.5rem",
      paddingTop: "2.25rem",
    },
  },
  compactSection: {
    marginBottom: "2.5rem",
    paddingTop: "1.5rem",
  },
  formReveal: {
    animationDelay: "200ms",
  },
  panel: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.line,
    boxShadow:
      "0 1px 0 color-mix(in oklab, var(--fg) 4%, transparent), 0 24px 48px -28px var(--glow)",
  },
  panelHead: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.75rem",
    paddingInline: "1rem",
    paddingBlock: "0.85rem",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colors.line,
    background:
      "linear-gradient(180deg, color-mix(in oklab, var(--accent) 6%, transparent), transparent)",
  },
  modeSwitch: {
    display: "inline-flex",
    padding: 2,
    gap: 2,
    backgroundColor: "color-mix(in oklab, var(--secondary) 70%, transparent)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.line,
  },
  modeBtn: {
    borderRadius: 0,
    borderWidth: 0,
    minHeight: "2rem",
    paddingInline: "0.85rem",
    fontSize: "0.62rem",
    letterSpacing: "0.14em",
  },
  modeActive: {
    backgroundColor: colors.accent,
    color: colors.accentFg,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
    ":hover": {
      filter: "none",
      color: colors.accentFg,
      backgroundColor: colors.accent,
    },
  },
  modeIdle: {
    backgroundColor: "transparent",
    color: colors.muted,
    ":hover": {
      color: colors.fg,
      backgroundColor: "color-mix(in oklab, var(--card) 55%, transparent)",
    },
  },
  body: {
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.85rem",
  },
  fieldBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "0.45rem",
  },
  fieldLabel: {
    fontFamily: fonts.body,
    fontSize: "0.8rem",
    fontWeight: 500,
    color: colors.fg,
  },
  row: {
    display: "flex",
    flexDirection: "column",
    gap: "0.65rem",
    "@media (min-width: 640px)": {
      flexDirection: "row",
      alignItems: "stretch",
      gap: 0,
    },
  },
  inputShell: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.line,
    backgroundColor: "color-mix(in oklab, var(--bg) 55%, var(--card))",
    transitionProperty: "border-color, box-shadow",
    transitionDuration: "150ms",
    ":focus-within": {
      borderColor: colors.accent,
      boxShadow: "0 0 0 3px color-mix(in oklab, var(--accent) 22%, transparent)",
    },
  },
  input: {
    height: "3.35rem",
    width: "100%",
    borderRadius: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    paddingInline: "0.95rem",
    fontSize: "0.95rem",
    ":focus-visible": {
      boxShadow: "0 0 0 0 transparent",
    },
  },
  submitBtn: {
    height: "3.35rem",
    minWidth: "9.5rem",
    borderRadius: 0,
    borderWidth: 0,
    paddingInline: "1.25rem",
    fontSize: "0.72rem",
    letterSpacing: "0.18em",
    "@media (min-width: 640px)": {
      borderLeftWidth: 1,
      borderLeftStyle: "solid",
      borderLeftColor: "color-mix(in oklab, var(--accent-fg) 18%, transparent)",
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
  arrowIcon: {
    display: "inline-flex",
    opacity: 0.85,
  },
  foot: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "0.35rem 1rem",
    paddingTop: "0.15rem",
  },
  meta: {
    fontFamily: fonts.mono,
    fontSize: "0.66rem",
    lineHeight: 1.5,
    letterSpacing: "0.02em",
    color: colors.muted,
  },
  linkBtn: {
    appearance: "none",
    background: "none",
    borderWidth: 0,
    padding: 0,
    color: "inherit",
    font: "inherit",
    letterSpacing: "inherit",
    cursor: "pointer",
    textDecoration: "underline",
    textUnderlineOffset: "0.22em",
    textDecorationColor: "color-mix(in oklab, var(--muted) 55%, transparent)",
    transitionProperty: "color, text-decoration-color",
    transitionDuration: "150ms",
    ":hover": {
      color: colors.accent,
      textDecorationColor: colors.accent,
    },
    ":disabled": {
      cursor: "default",
      opacity: 0.5,
    },
  },
  budgetToggle: {
    appearance: "none",
    background: "none",
    borderWidth: 0,
    padding: 0,
    fontFamily: fonts.mono,
    fontSize: "0.66rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: colors.muted,
    cursor: "pointer",
    transitionProperty: "color",
    transitionDuration: "150ms",
    ":hover": {
      color: colors.accent,
    },
    ":disabled": {
      cursor: "default",
      opacity: 0.5,
    },
  },
  advanced: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "0.75rem",
    padding: "0.85rem",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.line,
    backgroundColor: "color-mix(in oklab, var(--bg) 40%, transparent)",
    "@media (min-width: 640px)": {
      gridTemplateColumns: "1fr 1fr 1fr",
    },
  },
  advField: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },
  advLabel: {
    fontFamily: fonts.mono,
    fontSize: "0.6rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: colors.muted,
  },
  advInput: {
    height: "2.45rem",
    borderRadius: 0,
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
  const [mode, setMode] = useState<"url" | "sitemap">("url")
  const [showBudget, setShowBudget] = useState(false)
  const [minScore, setMinScore] = useState("50")
  const [maxLcpMs, setMaxLcpMs] = useState("2500")
  const [crawlLimit, setCrawlLimit] = useState("5")

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

  const crawl = useAction(analyzeSitemap, {
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

  const busy = analyze.isPending || demo.isPending || crawl.isPending
  const progress = useSimulatedProgress(busy)
  const showHero = Boolean(hero) && !busy

  function changeMode(next: "url" | "sitemap") {
    setMode(next)
    if (next === "sitemap") setShowBudget(true)
  }

  function submit() {
    const budget = {
      minScore: Number(minScore) || 50,
      maxLcpMs: Number(maxLcpMs) || 2500,
    }
    if (mode === "sitemap") {
      crawl.execute({ url, limit: Number(crawlLimit) || 5, ...budget })
    } else {
      analyze.execute({ url, ...budget })
    }
  }

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
            mode={mode}
            setMode={changeMode}
            showBudget={showBudget}
            setShowBudget={setShowBudget}
            minScore={minScore}
            setMinScore={setMinScore}
            maxLcpMs={maxLcpMs}
            setMaxLcpMs={setMaxLcpMs}
            crawlLimit={crawlLimit}
            setCrawlLimit={setCrawlLimit}
            onSubmit={submit}
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
            mode={mode}
            setMode={changeMode}
            showBudget={showBudget}
            setShowBudget={setShowBudget}
            minScore={minScore}
            setMinScore={setMinScore}
            maxLcpMs={maxLcpMs}
            setMaxLcpMs={setMaxLcpMs}
            crawlLimit={crawlLimit}
            setCrawlLimit={setCrawlLimit}
            onSubmit={submit}
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
  mode,
  setMode,
  showBudget,
  setShowBudget,
  minScore,
  setMinScore,
  maxLcpMs,
  setMaxLcpMs,
  crawlLimit,
  setCrawlLimit,
}: {
  url: string
  setUrl: (v: string) => void
  busy: boolean
  error: string | null
  onSubmit: () => void
  onDemo: () => void
  onDemoPoor: () => void
  compact?: boolean
  mode: "url" | "sitemap"
  setMode: (m: "url" | "sitemap") => void
  showBudget: boolean
  setShowBudget: (v: boolean) => void
  minScore: string
  setMinScore: (v: string) => void
  maxLcpMs: string
  setMaxLcpMs: (v: string) => void
  crawlLimit: string
  setCrawlLimit: (v: string) => void
}) {
  const { t } = useI18n()
  const advancedOpen = showBudget

  return (
    <div data-testid="measure-form" {...(compact ? {} : stylex.props(common.reveal, styles.formReveal))}>
      <form
        {...stylex.props(styles.panel)}
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
      >
        {!compact && (
          <div {...stylex.props(styles.panelHead)}>
            <p {...stylex.props(common.kicker)}>{t.form.kicker}</p>
            <div {...stylex.props(styles.modeSwitch)} data-testid="measure-mode" role="group" aria-label="Mode">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                data-testid="mode-url"
                style={[styles.modeBtn, mode === "url" ? styles.modeActive : styles.modeIdle]}
                disabled={busy}
                onClick={() => setMode("url")}
              >
                {t.form.modeUrl}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                data-testid="mode-sitemap"
                style={[styles.modeBtn, mode === "sitemap" ? styles.modeActive : styles.modeIdle]}
                disabled={busy}
                onClick={() => setMode("sitemap")}
              >
                {t.form.modeSitemap}
              </Button>
            </div>
          </div>
        )}

        <div {...stylex.props(styles.body)}>
          <div {...stylex.props(styles.fieldBlock)}>
            <Label {...stylex.props(styles.fieldLabel)} htmlFor="sweep-url">
              {mode === "sitemap" ? t.form.modeSitemap : t.form.urlLabel}
            </Label>
            <div {...stylex.props(styles.row)}>
              <div {...stylex.props(styles.inputShell)}>
                <Input
                  id="sweep-url"
                  data-testid="url-input"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={mode === "sitemap" ? "https://example.com/sitemap.xml" : t.form.placeholder}
                  {...stylex.props(styles.input)}
                  inputMode="url"
                  autoCapitalize="off"
                  spellCheck={false}
                  disabled={busy}
                />
              </div>
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
                    {mode === "sitemap" ? t.form.modeSitemap : t.form.analyze}
                    <span {...stylex.props(styles.arrowIcon)}>
                      <ArrowRight size={14} strokeWidth={2.25} />
                    </span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {!compact && advancedOpen && (
            <div {...stylex.props(styles.advanced)} data-testid="budget-fields">
              <label {...stylex.props(styles.advField)}>
                <span {...stylex.props(styles.advLabel)}>{t.form.minScore}</span>
                <Input
                  data-testid="budget-min-score"
                  type="number"
                  min={0}
                  max={100}
                  value={minScore}
                  onChange={(e) => setMinScore(e.target.value)}
                  disabled={busy}
                  {...stylex.props(styles.advInput)}
                />
              </label>
              <label {...stylex.props(styles.advField)}>
                <span {...stylex.props(styles.advLabel)}>{t.form.maxLcp}</span>
                <Input
                  data-testid="budget-max-lcp"
                  type="number"
                  min={100}
                  max={20000}
                  value={maxLcpMs}
                  onChange={(e) => setMaxLcpMs(e.target.value)}
                  disabled={busy}
                  {...stylex.props(styles.advInput)}
                />
              </label>
              {mode === "sitemap" && (
                <label {...stylex.props(styles.advField)}>
                  <span {...stylex.props(styles.advLabel)}>{t.form.crawlLimit}</span>
                  <Input
                    data-testid="crawl-limit"
                    type="number"
                    min={1}
                    max={8}
                    value={crawlLimit}
                    onChange={(e) => setCrawlLimit(e.target.value)}
                    disabled={busy}
                    {...stylex.props(styles.advInput)}
                  />
                </label>
              )}
            </div>
          )}

          {!compact && (
            <div {...stylex.props(styles.foot)}>
              <button
                type="button"
                data-testid="demo-button"
                disabled={busy}
                onClick={onDemo}
                {...stylex.props(styles.linkBtn, styles.meta)}
              >
                {t.form.demo}
              </button>
              <span {...stylex.props(styles.meta)} aria-hidden>
                ·
              </span>
              <button
                type="button"
                data-testid="demo-poor-button"
                disabled={busy}
                onClick={onDemoPoor}
                {...stylex.props(styles.linkBtn, styles.meta)}
              >
                {t.form.demoPoor}
              </button>
              <span {...stylex.props(styles.meta)} aria-hidden>
                ·
              </span>
              <button
                type="button"
                data-testid="budget-toggle"
                disabled={busy}
                aria-expanded={advancedOpen}
                onClick={() => setShowBudget(!showBudget)}
                {...stylex.props(styles.budgetToggle)}
              >
                {advancedOpen ? t.form.budgetHide : t.form.budgetToggle}
              </button>
            </div>
          )}
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
    </div>
  )
}
