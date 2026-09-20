"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { DEMO_REPORT, DEMO_REPORT_POOR } from "@/analysis/fixture"
import { normalizeUrl } from "@/analysis/pagespeed"
import { runAnalysis, runSitemapCrawl } from "@/analysis/run"
import { actionClient } from "@/server/safe-action"
import { saveReport } from "@/analysis/store"
import { DEFAULT_BUDGET } from "@/analysis/types"
import { normalizeBudget } from "@/analysis/budget"
import { evaluateBudget } from "@/analysis/budget"

const budgetSchema = z.object({
  minScore: z.coerce.number().min(0).max(100).optional(),
  maxLcpMs: z.coerce.number().min(100).max(20_000).optional(),
  maxCls: z.coerce.number().min(0).max(2).optional(),
  maxTbtMs: z.coerce.number().min(50).max(20_000).optional(),
})

const jobIdSchema = z.string().trim().min(8).max(80).optional()

const analyzeSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "Zadaj URL adresu.")
    .superRefine((value, ctx) => {
      try {
        normalizeUrl(value)
      } catch (e) {
        ctx.addIssue({
          code: "custom",
          message: e instanceof Error ? e.message : "Neplatná URL adresa.",
        })
      }
    }),
  jobId: jobIdSchema,
  minScore: budgetSchema.shape.minScore,
  maxLcpMs: budgetSchema.shape.maxLcpMs,
  maxCls: budgetSchema.shape.maxCls,
  maxTbtMs: budgetSchema.shape.maxTbtMs,
})

export const analyzeSite = actionClient.inputSchema(analyzeSchema).action(async ({ parsedInput }) => {
  const budget = normalizeBudget({
    minScore: parsedInput.minScore ?? DEFAULT_BUDGET.minScore,
    maxLcpMs: parsedInput.maxLcpMs ?? DEFAULT_BUDGET.maxLcpMs,
    maxCls: parsedInput.maxCls ?? DEFAULT_BUDGET.maxCls,
    maxTbtMs: parsedInput.maxTbtMs ?? DEFAULT_BUDGET.maxTbtMs,
  })
  const report = await runAnalysis(normalizeUrl(parsedInput.url), budget, parsedInput.jobId)
  redirect(`/r/${report.id}`)
})

const crawlSchema = z.object({
  url: z.string().trim().min(1, "Zadaj URL sitemapy alebo webu."),
  limit: z.coerce.number().min(1).max(8).optional().default(5),
  jobId: jobIdSchema,
  minScore: budgetSchema.shape.minScore,
  maxLcpMs: budgetSchema.shape.maxLcpMs,
  maxCls: budgetSchema.shape.maxCls,
  maxTbtMs: budgetSchema.shape.maxTbtMs,
})

export const analyzeSitemap = actionClient.inputSchema(crawlSchema).action(async ({ parsedInput }) => {
  const budget = normalizeBudget({
    minScore: parsedInput.minScore ?? DEFAULT_BUDGET.minScore,
    maxLcpMs: parsedInput.maxLcpMs ?? DEFAULT_BUDGET.maxLcpMs,
    maxCls: parsedInput.maxCls ?? DEFAULT_BUDGET.maxCls,
    maxTbtMs: parsedInput.maxTbtMs ?? DEFAULT_BUDGET.maxTbtMs,
  })
  const crawl = await runSitemapCrawl(parsedInput.url, {
    limit: parsedInput.limit,
    budget,
    jobId: parsedInput.jobId,
  })
  redirect(`/c/${crawl.id}`)
})

const demoSchema = z.object({
  variant: z.enum(["mid", "poor"]).optional().default("mid"),
})

export const loadDemo = actionClient.inputSchema(demoSchema).action(async ({ parsedInput }) => {
  const base = parsedInput.variant === "poor" ? DEMO_REPORT_POOR : DEMO_REPORT
  const budget = normalizeBudget(base.budget ?? DEFAULT_BUDGET)
  const report = {
    ...base,
    id: `${base.id}-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    budget,
    budgetResult: {
      mobile: evaluateBudget(base.mobile, budget),
      desktop: evaluateBudget(base.desktop, budget),
    },
  }
  await saveReport(report)
  redirect(`/r/${report.id}`)
})
