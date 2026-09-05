"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, Download, FileDown, Share2 } from "lucide-react"
import * as stylex from "@stylexjs/stylex"
import type { Report, Strategy, StrategyReport } from "@/analysis/types"
import { DEFAULT_BUDGET } from "@/analysis/types"
import { formatBytes, formatMs } from "@/analysis/pagespeed"
import { buildStrategyDelta, deltaTone, formatDelta } from "@/analysis/compare"
import { buildReportPdf } from "@/analysis/pdf"
import { evaluateBudget } from "@/analysis/budget"
import { ScoreGauge, RatingDot } from "./score-gauge"
import { Waterfall } from "./waterfall"
import { useOpportunityAnnotations } from "./use-opportunity-annotations"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button, buttonStyles } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useI18n } from "@/i18n/provider"
import type { Locale } from "@/i18n/messages"
import { colors, fonts } from "@/styles/tokens.stylex"
import { common } from "@/styles/common.stylex"

const DATE_LOCALE: Record<Locale, string> = {
  sk: "sk-SK",
  cs: "cs-CZ",
  en: "en-GB",
}

const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "4rem",
  },
  masthead: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "1.5rem",
    paddingBottom: "2rem",
  },
  mastLeft: {
    minWidth: 0,
  },
  hostLink: {
    marginTop: "0.75rem",
    display: "block",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontFamily: fonts.display,
    fontSize: "2.1rem",
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: "-0.025em",
    ":hover": {
      color: colors.accent,
    },
  },
  meta: {
    marginTop: "0.75rem",
    fontFamily: fonts.mono,
    fontSize: "0.7rem",
    letterSpacing: "0.025em",
    color: colors.muted,
  },
  metaSep: {
    marginInline: "0.5rem",
    color: colors.line,
  },
  metaLink: {
    color: colors.muted,
    transitionProperty: "color",
    transitionDuration: "150ms",
    ":hover": {
      color: colors.accent,
    },
  },
  toolbar: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 1,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.line,
  },
  tabTrigger: {
    borderRadius: 0,
  },
  scoreRow: {
    position: "relative",
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
  },
  cellKicker: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  cellValue: {
    marginTop: "0.75rem",
    fontFamily: fonts.display,
    fontSize: "1.85rem",
    lineHeight: 1,
    fontFeatureSettings: '"tnum"',
  },
  cellValueSm: {
    marginTop: "0.75rem",
    fontFamily: fonts.display,
    fontSize: "1.5rem",
    fontFeatureSettings: '"tnum"',
  },
  cellHint: {
    marginTop: "0.5rem",
    fontFamily: fonts.mono,
    fontSize: "0.62rem",
    letterSpacing: "0.025em",
    color: colors.muted,
  },
  cellHintLoose: {
    marginTop: "0.5rem",
    fontFamily: fonts.mono,
    fontSize: "0.65rem",
    letterSpacing: "0.025em",
    color: colors.muted,
  },
  filmstrip: {
    display: "flex",
    gap: 1,
    overflowX: "auto",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.line,
  },
  frame: {
    width: "8rem",
    flexShrink: 0,
    backgroundColor: colors.card,
  },
  frameImg: {
    width: "100%",
  },
  frameCap: {
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: colors.line,
    paddingBlock: "0.375rem",
    textAlign: "center",
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.muted,
  },
  split: {
    display: "grid",
    gap: "3rem",
    "@media (min-width: 1024px)": {
      gridTemplateColumns: "1fr 1fr",
      gap: "2.5rem",
    },
  },
  empty: {
    paddingInline: "1.25rem",
    paddingBlock: "2rem",
    fontFamily: fonts.mono,
    fontSize: "0.875rem",
    color: colors.muted,
  },
  triggerInner: {
    display: "flex",
    minWidth: 0,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    alignItems: "flex-start",
    gap: "1rem",
  },
  triggerBody: {
    minWidth: 0,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    textAlign: "left",
  },
  triggerTitle: {
    display: "block",
    fontWeight: 500,
  },
  triggerMeta: {
    marginTop: "0.125rem",
    display: "block",
    fontFamily: fonts.mono,
    fontSize: "0.68rem",
    fontWeight: 400,
    letterSpacing: "0.025em",
    color: colors.muted,
  },
  accordionTrigger: {
    paddingInline: "1.25rem",
    paddingBlock: "1rem",
  },
  accordionContent: {
    paddingInline: "1.25rem",
    paddingBottom: "1rem",
    fontSize: "0.875rem",
    lineHeight: 1.625,
    color: colors.muted,
    "@media (min-width: 640px)": {
      paddingLeft: "6.5rem",
    },
  },
  strengthRow: {
    display: "flex",
    gap: "1rem",
    paddingInline: "1.25rem",
    paddingBlock: "1rem",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colors.line,
    ":last-child": {
      borderBottomWidth: 0,
    },
  },
  strengthIcon: {
    marginTop: "0.25rem",
    display: "inline-flex",
    width: "1.25rem",
    height: "1.25rem",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.good,
    backgroundColor: "color-mix(in oklab, var(--good) 15%, transparent)",
    color: colors.good,
  },
  strengthBody: {
    minWidth: 0,
  },
  strengthTitle: {
    fontWeight: 500,
    lineHeight: 1.375,
  },
  strengthValue: {
    marginTop: "0.25rem",
    fontFamily: fonts.mono,
    fontSize: "0.68rem",
    letterSpacing: "0.025em",
    color: colors.good,
  },
  strengthDesc: {
    marginTop: "0.375rem",
    fontSize: "0.875rem",
    lineHeight: 1.625,
    color: colors.muted,
  },
  waterfallPad: {
    padding: "1.25rem",
  },
  sectionTitle: {
    marginBottom: "1.25rem",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "0.75rem",
  },
  sectionKicker: {
    marginBottom: "0.5rem",
  },
  sectionHeading: {
    fontFamily: fonts.display,
    fontSize: "1.85rem",
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: "-0.025em",
  },
  sectionSub: {
    maxWidth: "24rem",
    fontFamily: fonts.mono,
    fontSize: "0.68rem",
    letterSpacing: "0.025em",
    color: colors.muted,
  },
  tooltipTrigger: {
    cursor: "help",
    borderWidth: 0,
    backgroundColor: "transparent",
    padding: 0,
    font: "inherit",
    letterSpacing: "inherit",
    textTransform: "uppercase",
  },
  impactBadge: {
    marginTop: "0.125rem",
    minWidth: "4.5rem",
    justifyContent: "flex-start",
    borderWidth: 0,
    paddingInline: 0,
  },
  tableWrap: {
    overflow: "hidden",
  },
  tableRowHead: {
    borderTopWidth: 0,
  },
  cellMuted: {
    color: colors.muted,
  },
  cellStrong: {
    fontWeight: 500,
    fontFeatureSettings: '"tnum"',
  },
  engineBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.line,
    backgroundColor: colors.card,
    paddingInline: "0.55rem",
    paddingBlock: "0.2rem",
    fontFamily: fonts.mono,
    fontSize: "0.62rem",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: colors.muted,
  },
  labTag: {
    marginLeft: "0.35rem",
    fontFamily: fonts.mono,
    fontSize: "0.55rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: colors.muted,
  },
  fixPlan: {
    display: "grid",
    gap: 1,
    marginBottom: "1.25rem",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.line,
    backgroundColor: colors.line,
  },
  fixStep: {
    display: "grid",
    gridTemplateColumns: "2.5rem 1fr auto",
    gap: "1rem",
    alignItems: "start",
    backgroundColor: colors.card,
    paddingInline: "1.25rem",
    paddingBlock: "1.1rem",
  },
  fixIndex: {
    fontFamily: fonts.display,
    fontSize: "1.6rem",
    lineHeight: 1,
    color: colors.accent,
  },
  fixTitle: {
    fontWeight: 500,
    lineHeight: 1.35,
  },
  fixMeta: {
    marginTop: "0.25rem",
    fontFamily: fonts.mono,
    fontSize: "0.68rem",
    letterSpacing: "0.025em",
    color: colors.muted,
  },
  fixDesc: {
    marginTop: "0.45rem",
    fontSize: "0.875rem",
    lineHeight: 1.55,
    color: colors.muted,
  },
  fixSave: {
    fontFamily: fonts.mono,
    fontSize: "0.72rem",
    letterSpacing: "0.04em",
    color: colors.accent,
    whiteSpace: "nowrap",
  },
  shot: {
    maxWidth: "22rem",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  shotImg: {
    width: "100%",
    display: "block",
  },
  deltaGood: { color: colors.good },
  deltaBad: { color: colors.bad },
  deltaFlat: { color: colors.muted },
  fieldEmpty: {
    paddingInline: "1.25rem",
    paddingBlock: "1.25rem",
    fontFamily: fonts.mono,
    fontSize: "0.8rem",
    lineHeight: 1.55,
    color: colors.muted,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  budgetPass: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.good,
    backgroundColor: "color-mix(in oklab, var(--good) 12%, var(--card))",
    paddingInline: "1.25rem",
    paddingBlock: "1rem",
  },
  budgetFail: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.bad,
    backgroundColor: "color-mix(in oklab, var(--bad) 10%, var(--card))",
    paddingInline: "1.25rem",
    paddingBlock: "1rem",
  },
  budgetTitle: {
    fontFamily: fonts.mono,
    fontSize: "0.68rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
  },
  budgetList: {
    marginTop: "0.5rem",
    marginBottom: 0,
    paddingLeft: "1.1rem",
    fontSize: "0.88rem",
    lineHeight: 1.5,
    color: colors.muted,
  },
  catGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 1,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.line,
    backgroundColor: colors.line,
    "@media (min-width: 640px)": {
      gridTemplateColumns: "repeat(4, 1fr)",
    },
  },
  fixedBtn: {
    marginTop: "0.75rem",
  },
  fixedMark: {
    opacity: 0.55,
    textDecoration: "line-through",
  },
})

function ratingStyle(rating: "good" | "ni" | "poor") {
  if (rating === "good") return common.ratingGood
  if (rating === "ni") return common.ratingNi
  return common.ratingPoor
}

export function ReportView({ report, previous }: { report: Report; previous?: Report | null }) {
  const { t, locale } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialStrategy = searchParams.get("s") === "desktop" ? "desktop" : "mobile"
  const [strategy, setStrategy] = useState<Strategy>(initialStrategy)
  const [copied, setCopied] = useState(false)
  const annotations = useOpportunityAnnotations(report.id)
  const data = report[strategy]
  const budget = report.budget ?? DEFAULT_BUDGET
  const budgetCheck = report.budgetResult?.[strategy] ?? evaluateBudget(data, budget)
  const categories = data.categories ?? {
    performance: data.score,
    accessibility: null,
    bestPractices: null,
    seo: null,
  }
  const strengths = data.strengths ?? []
  const fixPlan = useMemo(
    () => [...data.opportunities].sort((a, b) => b.savingsMs - a.savingsMs).slice(0, 3),
    [data.opportunities],
  )
  const [open, setOpen] = useState<string[]>(() =>
    data.opportunities[0]?.id ? [data.opportunities[0].id] : [],
  )

  useEffect(() => {
    setStrategy(searchParams.get("s") === "desktop" ? "desktop" : "mobile")
  }, [searchParams])

  useEffect(() => {
    setOpen(data.opportunities[0]?.id ? [data.opportunities[0].id] : [])
  }, [strategy, data.opportunities])

  function changeStrategy(next: Strategy) {
    setStrategy(next)
    const params = new URLSearchParams(searchParams.toString())
    if (next === "desktop") params.set("s", "desktop")
    else params.delete("s")
    const q = params.toString()
    router.replace(q ? `?${q}` : "?", { scroll: false })
  }

  async function share() {
    const link = `${window.location.origin}/r/${report.id}${strategy === "desktop" ? "?s=desktop" : ""}`
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  function downloadPdf() {
    const bytes = buildReportPdf(report, strategy)
    const blob = new Blob([Uint8Array.from(bytes)], { type: "application/pdf" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `sweep-${strategy}-${report.id.slice(0, 8)}.pdf`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const host = report.finalUrl.replace(/^https?:\/\//, "")
  const engineLabel =
    report.engine === "psi" ? t.report.enginePsi : report.engine === "demo" ? t.report.engineDemo : t.report.engineLh
  const prevStrategy = previous?.[strategy]

  return (
    <div data-testid="report-view" {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.masthead)}>
        <div {...stylex.props(styles.mastLeft)}>
          <p {...stylex.props(common.kicker)}>{t.report.dossier}</p>
          <a
            href={report.finalUrl}
            data-testid="report-host"
            {...stylex.props(styles.hostLink)}
            target="_blank"
            rel="noreferrer"
          >
            {host}
          </a>
          <p {...stylex.props(styles.meta)}>
            {new Date(report.createdAt).toLocaleString(DATE_LOCALE[locale])}
            <span {...stylex.props(styles.metaSep)}>·</span>
            <span data-testid="report-engine" {...stylex.props(styles.engineBadge)}>
              {engineLabel}
            </span>
            <span {...stylex.props(styles.metaSep)}>·</span>
            <a href="/" data-testid="report-new-scan" {...stylex.props(styles.metaLink)}>
              {t.report.newScan}
            </a>
          </p>
        </div>
        <div data-testid="report-toolbar" {...stylex.props(styles.toolbar, common.noPrint)}>
          <Tabs value={strategy} onValueChange={(value) => changeStrategy(value as Strategy)}>
            <TabsList>
              <TabsTrigger value="mobile" data-testid="tab-mobile" style={styles.tabTrigger}>
                {t.report.mobile}
              </TabsTrigger>
              <TabsTrigger value="desktop" data-testid="tab-desktop" style={styles.tabTrigger}>
                {t.report.desktop}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            type="button"
            variant="ghost"
            data-testid="export-csv"
            style={buttonStyles.roundedNone}
            onClick={() => exportCsv(report, strategy)}
          >
            <Download size={14} /> CSV
          </Button>
          <Button
            type="button"
            variant="ghost"
            data-testid="export-pdf"
            style={buttonStyles.roundedNone}
            onClick={downloadPdf}
          >
            <FileDown size={14} /> PDF
          </Button>
          <Button
            type="button"
            variant="ghost"
            data-testid="share-link"
            style={buttonStyles.roundedNone}
            onClick={() => void share()}
          >
            {copied ? <Check size={14} /> : <Share2 size={14} />}
            {copied ? t.report.copied : t.report.link}
          </Button>
        </div>
      </div>
      <Separator />

      <div
        data-testid="budget-banner"
        {...stylex.props(budgetCheck.passed ? styles.budgetPass : styles.budgetFail)}
      >
        <p {...stylex.props(styles.budgetTitle, budgetCheck.passed ? common.ratingGood : common.ratingPoor)}>
          {budgetCheck.passed ? t.report.budgetPass : t.report.budgetFail}
          {" · "}
          {t.report.score} ≥ {budget.minScore} · LCP ≤ {formatMs(budget.maxLcpMs)}
        </p>
        {!budgetCheck.passed && (
          <ul {...stylex.props(styles.budgetList)}>
            {budgetCheck.failures.map((f) => (
              <li key={f.id}>
                {f.label}: {f.actual} ({f.limit})
              </li>
            ))}
          </ul>
        )}
      </div>

      <div data-testid="score-row" {...stylex.props(styles.scoreRow)}>
        <ScoreGauge
          score={data.score}
          label={strategy === "mobile" ? t.report.mobile.toLowerCase() : t.report.desktop.toLowerCase()}
        />
        <div {...stylex.props(styles.metrics)}>
          <MetricCell title="LCP" hint="Largest Contentful Paint" metric={data.lcp} lab={t.report.labBadge} />
          <MetricCell
            title={data.inp?.id === "fid" ? "FID" : "INP"}
            hint={data.inp ? "Field interactivity (CrUX) when available" : "Lab: Total Blocking Time"}
            metric={data.inp ?? data.tbt}
            lab={data.inp ? t.report.fieldBadge : t.report.labBadge}
          />
          <MetricCell title="CLS" hint="Cumulative Layout Shift" metric={data.cls} lab={t.report.labBadge} />
          <MetricCell title="FCP" hint="First Contentful Paint" metric={data.fcp} lab={t.report.labBadge} />
          <MetricCell title="TTFB" hint="Time to First Byte" metric={data.ttfb} lab={t.report.labBadge} />
          <article {...stylex.props(styles.cell)}>
            <p {...stylex.props(common.kicker)}>
              {t.report.transfer}
              <span {...stylex.props(styles.labTag)}>{t.report.labBadge}</span>
            </p>
            <p {...stylex.props(styles.cellValue)}>{formatBytes(data.bytes)}</p>
            <p {...stylex.props(styles.cellHintLoose)}>
              {data.requests} {t.report.requests}
            </p>
          </article>
        </div>
      </div>

      <section data-testid="categories-section">
        <SectionTitle index="03b" title={t.report.categoriesTitle} subtitle={t.report.categoriesSub} />
        <div {...stylex.props(styles.catGrid)}>
          <CatCell label="Performance" value={categories.performance} />
          <CatCell label="Accessibility" value={categories.accessibility} />
          <CatCell label="Best Practices" value={categories.bestPractices} />
          <CatCell label="SEO" value={categories.seo} />
        </div>
      </section>

      <section data-testid="field-section">
        <SectionTitle index="04" title={t.report.fieldTitle} subtitle={t.report.fieldSub} />
        {report.field.length > 0 ? (
          <div {...stylex.props(styles.metrics)}>
            {report.field.map((f) => (
              <article key={f.id} {...stylex.props(styles.cell)}>
                <p {...stylex.props(common.kicker, styles.cellKicker)}>
                  <RatingDot rating={f.category} /> {f.label}
                  <span {...stylex.props(styles.labTag)}>{t.report.fieldBadge}</span>
                </p>
                <p {...stylex.props(styles.cellValueSm, ratingStyle(f.category))}>{f.display}</p>
              </article>
            ))}
          </div>
        ) : (
          <p data-testid="field-empty" {...stylex.props(styles.fieldEmpty)}>
            {t.report.fieldEmpty}
          </p>
        )}
      </section>

      {(data.filmstrip.length > 0 || data.screenshot) && (
        <section data-testid="filmstrip-section">
          <SectionTitle
            index="05"
            title={data.filmstrip.length > 0 ? t.report.filmstripTitle : t.report.screenshotTitle}
            subtitle={t.report.filmstripSub}
          />
          {data.filmstrip.length > 0 ? (
            <div data-testid="filmstrip" {...stylex.props(styles.filmstrip)}>
              {data.filmstrip.map((f) => (
                <figure key={`${f.timing}-${f.data.slice(0, 24)}`} {...stylex.props(styles.frame)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.data} alt="" loading="lazy" decoding="async" {...stylex.props(styles.frameImg)} />
                  <figcaption {...stylex.props(styles.frameCap)}>{formatMs(f.timing)}</figcaption>
                </figure>
              ))}
            </div>
          ) : data.screenshot ? (
            <figure data-testid="final-screenshot" {...stylex.props(styles.shot)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.screenshot} alt="" loading="lazy" decoding="async" {...stylex.props(styles.shotImg)} />
            </figure>
          ) : null}
        </section>
      )}

      {fixPlan.length > 0 && (
        <section data-testid="fix-plan">
          <SectionTitle index="06" title={t.report.fixPlanTitle} subtitle={t.report.fixPlanSub} />
          <div {...stylex.props(styles.fixPlan)}>
            {fixPlan.map((op, i) => (
              <article key={op.id} data-testid={`fix-step-${i + 1}`} {...stylex.props(styles.fixStep)}>
                <span {...stylex.props(styles.fixIndex)}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 {...stylex.props(styles.fixTitle)}>{op.title}</h3>
                  <p {...stylex.props(styles.fixMeta)}>
                    <ImpactBadge impact={op.impact} />
                  </p>
                  <p {...stylex.props(styles.fixDesc)}>{op.description}</p>
                </div>
                <span {...stylex.props(styles.fixSave)}>{op.displayValue ?? formatMs(op.savingsMs)}</span>
              </article>
            ))}
          </div>
        </section>
      )}

      <div {...stylex.props(styles.split)}>
        <section>
          <SectionTitle index="07" title={t.report.improveTitle} subtitle={t.report.improveSub} />
          <div {...stylex.props(common.plate)}>
            {data.opportunities.length === 0 ? (
              <p {...stylex.props(styles.empty)}>{t.report.improveEmpty}</p>
            ) : (
              <Accordion value={open} onValueChange={setOpen}>
                {data.opportunities.map((op) => {
                  const done = annotations.isFixed(op.id)
                  return (
                    <AccordionItem key={op.id} value={op.id}>
                      <AccordionTrigger style={styles.accordionTrigger}>
                        <span {...stylex.props(styles.triggerInner, done && styles.fixedMark)}>
                          <ImpactBadge impact={op.impact} />
                          <span {...stylex.props(styles.triggerBody)}>
                            <span {...stylex.props(styles.triggerTitle)}>
                              {done ? `✓ ${op.title}` : op.title}
                            </span>
                            <span {...stylex.props(styles.triggerMeta)}>
                              {op.displayValue ?? formatMs(op.savingsMs)}
                              {op.id.startsWith("metric-") ? "" : ` · ~${op.scoreHint} b`}
                            </span>
                          </span>
                        </span>
                      </AccordionTrigger>
                      <AccordionPanel>
                        <AccordionContent style={styles.accordionContent}>
                          {op.description}
                          <div {...stylex.props(styles.fixedBtn, common.noPrint)}>
                            <Button
                              type="button"
                              size="sm"
                              variant={done ? "secondary" : "outline"}
                              data-testid={`annotate-${op.id}`}
                              style={buttonStyles.roundedNone}
                              onClick={() => annotations.toggle(op.id)}
                            >
                              {done ? t.report.annotationUndo : t.report.annotationDone}
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionPanel>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            )}
          </div>
        </section>

        <section>
          <SectionTitle index="08" title={t.report.goodTitle} subtitle={t.report.goodSub} />
          <div {...stylex.props(common.plate)}>
            {strengths.length === 0 ? (
              <p {...stylex.props(styles.empty)}>{t.report.goodEmpty}</p>
            ) : (
              strengths.map((s) => (
                <article key={s.id} {...stylex.props(styles.strengthRow)}>
                  <span {...stylex.props(styles.strengthIcon)}>
                    <Check size={12} strokeWidth={2.5} />
                  </span>
                  <div {...stylex.props(styles.strengthBody)}>
                    <h3 {...stylex.props(styles.strengthTitle)}>{s.title}</h3>
                    {s.displayValue && <p {...stylex.props(styles.strengthValue)}>{s.displayValue}</p>}
                    <p {...stylex.props(styles.strengthDesc)}>{s.description}</p>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      <section data-testid="waterfall-section">
        <SectionTitle index="09" title={t.report.waterfallTitle} subtitle={t.report.waterfallSub} />
        <div {...stylex.props(common.plate, styles.waterfallPad)}>
          <Waterfall items={data.waterfall} />
        </div>
      </section>

      {prevStrategy && previous && (
        <AbCompare current={data} previous={prevStrategy} previousAt={previous.createdAt} locale={locale} />
      )}

      <Compare mobile={report.mobile} desktop={report.desktop} />
    </div>
  )
}

function SectionTitle({ index, title, subtitle }: { index: string; title: string; subtitle: string }) {
  return (
    <div {...stylex.props(styles.sectionTitle)}>
      <div>
        <p {...stylex.props(common.kicker, styles.sectionKicker)}>{index}</p>
        <h2 {...stylex.props(styles.sectionHeading)}>{title}</h2>
      </div>
      <p {...stylex.props(styles.sectionSub)}>{subtitle}</p>
    </div>
  )
}

function MetricCell({
  title,
  hint,
  metric,
  lab,
}: {
  title: string
  hint: string
  metric: StrategyReport["lcp"]
  lab?: string
}) {
  return (
    <article {...stylex.props(styles.cell)}>
      <p {...stylex.props(common.kicker, styles.cellKicker)}>
        <RatingDot rating={metric.rating} />
        <Tooltip>
          <TooltipTrigger {...stylex.props(styles.tooltipTrigger)}>{title}</TooltipTrigger>
          <TooltipContent>{hint}</TooltipContent>
        </Tooltip>
        {lab && <span {...stylex.props(styles.labTag)}>{lab}</span>}
      </p>
      <p {...stylex.props(styles.cellValue, ratingStyle(metric.rating))}>{metric.display}</p>
      <p {...stylex.props(styles.cellHint)}>{hint}</p>
    </article>
  )
}

function CatCell({ label, value }: { label: string; value: number | null }) {
  const tone = value == null ? null : value >= 90 ? "good" : value >= 50 ? "ni" : "poor"
  return (
    <article {...stylex.props(styles.cell)}>
      <p {...stylex.props(common.kicker)}>{label}</p>
      <p {...stylex.props(styles.cellValue, tone ? ratingStyle(tone) : undefined)}>
        {value == null ? "—" : value}
      </p>
    </article>
  )
}

function ImpactBadge({ impact }: { impact: "high" | "medium" | "low" }) {
  const { t } = useI18n()
  const map = {
    high: { t: t.report.impactHigh, v: "high" as const },
    medium: { t: t.report.impactMedium, v: "medium" as const },
    low: { t: t.report.impactLow, v: "low" as const },
  }[impact]
  return (
    <Badge variant={map.v} style={styles.impactBadge}>
      {map.t}
    </Badge>
  )
}

function AbCompare({
  current,
  previous,
  previousAt,
  locale,
}: {
  current: StrategyReport
  previous: StrategyReport
  previousAt: string
  locale: Locale
}) {
  const { t } = useI18n()
  const rows = useMemo(() => buildStrategyDelta(current, previous), [current, previous])
  return (
    <section>
      <SectionTitle
        index="10"
        title={t.report.abTitle}
        subtitle={`${t.report.abSub} (${new Date(previousAt).toLocaleString(DATE_LOCALE[locale])})`}
      />
      <div {...stylex.props(common.plate, styles.tableWrap)}>
        <Table>
          <TableHeader>
            <TableRow style={styles.tableRowHead}>
              <TableHead>{t.report.metric}</TableHead>
              <TableHead>{t.report.abPrevious}</TableHead>
              <TableHead>{t.report.abCurrent}</TableHead>
              <TableHead>{t.report.abDelta}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const tone = deltaTone(row)
              const prevDisplay = row.key === "bytes" ? formatBytes(Number(row.previous)) : row.previous
              const curDisplay = row.key === "bytes" ? formatBytes(Number(row.current)) : row.current
              return (
                <TableRow key={row.key}>
                  <TableCell style={styles.cellMuted}>{row.key === "score" ? t.report.score : row.label}</TableCell>
                  <TableCell style={styles.cellStrong}>{prevDisplay}</TableCell>
                  <TableCell style={styles.cellStrong}>{curDisplay}</TableCell>
                  <TableCell
                    style={
                      tone === "good"
                        ? [styles.cellStrong, styles.deltaGood]
                        : tone === "bad"
                          ? [styles.cellStrong, styles.deltaBad]
                          : [styles.cellStrong, styles.deltaFlat]
                    }
                  >
                    {formatDelta(row)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}

function Compare({ mobile, desktop }: { mobile: StrategyReport; desktop: StrategyReport }) {
  const { t } = useI18n()
  const rows = useMemo(
    () => [
      [t.report.score, String(mobile.score), String(desktop.score)],
      ["LCP", mobile.lcp.display, desktop.lcp.display],
      ["TBT", mobile.tbt.display, desktop.tbt.display],
      ["CLS", mobile.cls.display, desktop.cls.display],
      ["FCP", mobile.fcp.display, desktop.fcp.display],
      ["TTFB", mobile.ttfb.display, desktop.ttfb.display],
      [t.report.size, formatBytes(mobile.bytes), formatBytes(desktop.bytes)],
      [t.report.requests, String(mobile.requests), String(desktop.requests)],
    ],
    [mobile, desktop, t],
  )
  return (
    <section>
      <SectionTitle index="11" title={t.report.compareTitle} subtitle={t.report.compareSub} />
      <div {...stylex.props(common.plate, styles.tableWrap)}>
        <Table>
          <TableHeader>
            <TableRow style={styles.tableRowHead}>
              <TableHead>{t.report.metric}</TableHead>
              <TableHead>{t.report.mobile}</TableHead>
              <TableHead>{t.report.desktop}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r[0]}>
                {r.map((c, i) => (
                  <TableCell key={`${r[0]}-${i}`} style={i === 0 ? styles.cellMuted : styles.cellStrong}>
                    {c}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}

function exportCsv(report: Report, strategy: Strategy) {
  const d = report[strategy]
  const lines = [
    ["url", report.url],
    ["strategy", strategy],
    ["score", d.score],
    ["lcp_ms", d.lcp.numeric],
    ["tbt_ms", d.tbt.numeric],
    ["cls", d.cls.numeric],
    ["fcp_ms", d.fcp.numeric],
    ["ttfb_ms", d.ttfb.numeric],
    ["bytes", d.bytes],
    ["requests", d.requests],
    [],
    ["opportunity", "savings_ms", "impact"],
    ...d.opportunities.map((o) => [o.title, o.savingsMs, o.impact]),
    [],
    ["strength", "value"],
    ...(d.strengths ?? []).map((s) => [s.title, s.displayValue ?? ""]),
    [],
    ["request_url", "start_ms", "duration_ms", "bytes", "type"],
    ...d.waterfall.map((w) => [w.url, Math.round(w.start), Math.round(w.duration), w.transferSize, w.type]),
  ]
  const csv = lines.map((row) => row.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = `sweep-${strategy}-${report.id.slice(0, 8)}.csv`
  a.click()
}
