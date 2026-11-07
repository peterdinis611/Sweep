"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { DEMO_REPORT, DEMO_REPORT_POOR } from "@/analysis/fixture"
import { normalizeUrl } from "@/analysis/pagespeed"
import { runAnalysis, runSitemapCrawl } from "@/analysis/run"
import { demosEnabled } from "@/config/flags"
import { actionClient } from "@/server/safe-action"
import { clientKey, rateLimit } from "@/server/rate-limit"
import { requestIp } from "@/server/request-ip"
import { deleteReport, loadReport, saveReport } from "@/analysis/store"
import { DEFAULT_BUDGET } from "@/analysis/types"
import { normalizeBudget } from "@/analysis/budget"
import { evaluateBudget } from "@/analysis/budget"
import { loadProjectBudget, saveProjectBudget } from "@/analysis/budget-file"
import { listRecentLabs } from "@/analysis/labs"
import { cancelJob, JobCancelledError, QueueFullError } from "@/analysis/queue"
import { clearOwnerCookie, setOwnerCookie, verifyOwner } from "@/analysis/ownership"

async function guardLabWrite(bucket: string) {
  const ip = await requestIp()
  rateLimit(clientKey(ip, bucket))
}

const budgetSchema = z.object({
  minScore: z.coerce.number().min(0).max(100).optional(),
  maxLcpMs: z.coerce.number().min(100).max(20_000).optional(),
  maxCls: z.coerce.number().min(0).max(2).optional(),
  maxTbtMs: z.coerce.number().min(50).max(20_000).optional(),
})

const jobIdSchema = z.string().trim().min(8).max(80).optional()
const throttleSchema = z.enum(["mobileDefault", "slow4g", "cable", "unthrottled"]).optional()

const analyzeSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "Enter a URL.")
    .superRefine((value, ctx) => {
      try {
        normalizeUrl(value)
      } catch (e) {
        ctx.addIssue({
          code: "custom",
          message: e instanceof Error ? e.message : "Invalid URL.",
        })
      }
    }),
  jobId: jobIdSchema,
  throttle: throttleSchema,
  runs: z.coerce.number().min(1).max(5).optional(),
  cookie: z.string().max(4000).optional(),
  authorization: z.string().max(2000).optional(),
  minScore: budgetSchema.shape.minScore,
  maxLcpMs: budgetSchema.shape.maxLcpMs,
  maxCls: budgetSchema.shape.maxCls,
  maxTbtMs: budgetSchema.shape.maxTbtMs,
})

function headersFromInput(input: { cookie?: string; authorization?: string }) {
  const cookie = input.cookie?.trim()
  const authorization = input.authorization?.trim()
  if (!cookie && !authorization) return undefined
  return { cookie, authorization }
}

export const analyzeSite = actionClient.inputSchema(analyzeSchema).action(async ({ parsedInput }) => {
  await guardLabWrite("analyze")
  const budget = normalizeBudget({
    minScore: parsedInput.minScore ?? DEFAULT_BUDGET.minScore,
    maxLcpMs: parsedInput.maxLcpMs ?? DEFAULT_BUDGET.maxLcpMs,
    maxCls: parsedInput.maxCls ?? DEFAULT_BUDGET.maxCls,
    maxTbtMs: parsedInput.maxTbtMs ?? DEFAULT_BUDGET.maxTbtMs,
  })
  let report
  try {
    report = await runAnalysis(normalizeUrl(parsedInput.url), budget, parsedInput.jobId, {
      throttle: parsedInput.throttle,
      runs: parsedInput.runs ?? 1,
      headers: headersFromInput(parsedInput),
    })
  } catch (e) {
    if (e instanceof QueueFullError || e instanceof JobCancelledError) throw e
    throw e
  }
  if (report.ownerToken) await setOwnerCookie(report.id, report.ownerToken)
  redirect(`/r/${report.id}`)
})

const crawlSchema = z.object({
  url: z.string().trim().min(1, "Enter a sitemap or site URL."),
  limit: z.coerce.number().min(1).max(8).optional().default(5),
  jobId: jobIdSchema,
  throttle: throttleSchema,
  runs: z.coerce.number().min(1).max(5).optional(),
  cookie: z.string().max(4000).optional(),
  authorization: z.string().max(2000).optional(),
  minScore: budgetSchema.shape.minScore,
  maxLcpMs: budgetSchema.shape.maxLcpMs,
  maxCls: budgetSchema.shape.maxCls,
  maxTbtMs: budgetSchema.shape.maxTbtMs,
})

export const analyzeSitemap = actionClient.inputSchema(crawlSchema).action(async ({ parsedInput }) => {
  await guardLabWrite("crawl")
  const budget = normalizeBudget({
    minScore: parsedInput.minScore ?? DEFAULT_BUDGET.minScore,
    maxLcpMs: parsedInput.maxLcpMs ?? DEFAULT_BUDGET.maxLcpMs,
    maxCls: parsedInput.maxCls ?? DEFAULT_BUDGET.maxCls,
    maxTbtMs: parsedInput.maxTbtMs ?? DEFAULT_BUDGET.maxTbtMs,
  })
  let crawl
  try {
    crawl = await runSitemapCrawl(normalizeUrl(parsedInput.url), {
      limit: parsedInput.limit,
      budget,
      jobId: parsedInput.jobId,
      throttle: parsedInput.throttle,
      runs: parsedInput.runs ?? 1,
      headers: headersFromInput(parsedInput),
    })
  } catch (e) {
    if (e instanceof QueueFullError || e instanceof JobCancelledError) throw e
    throw e
  }
  redirect(`/c/${crawl.id}`)
})

const demoSchema = z.object({
  variant: z.enum(["mid", "poor"]).optional().default("mid"),
})

export const loadDemo = actionClient.inputSchema(demoSchema).action(async ({ parsedInput }) => {
  if (!demosEnabled()) throw new Error("Demos are disabled on this deployment.")
  await guardLabWrite("demo")
  const base = parsedInput.variant === "poor" ? DEMO_REPORT_POOR : DEMO_REPORT
  const budget = normalizeBudget(base.budget ?? DEFAULT_BUDGET)
  const { randomUUID } = await import("node:crypto")
  const id = `${base.id}-${Date.now().toString(36)}`
  const ownerToken = randomUUID()
  const report = {
    ...base,
    id,
    createdAt: new Date().toISOString(),
    ownerToken,
    budget,
    budgetResult: {
      mobile: evaluateBudget(base.mobile, budget),
      desktop: evaluateBudget(base.desktop, budget),
    },
  }
  await saveReport(report)
  await setOwnerCookie(id, ownerToken)
  redirect(`/r/${id}`)
})

export const getProjectBudget = actionClient.action(async () => {
  return (await loadProjectBudget()) ?? DEFAULT_BUDGET
})

export const persistProjectBudget = actionClient.inputSchema(budgetSchema).action(async ({ parsedInput }) => {
  return saveProjectBudget(parsedInput)
})

export const getRecentLabs = actionClient.action(async () => {
  return listRecentLabs(24)
})

const cancelSchema = z.object({
  jobId: z.string().trim().min(8).max(80),
})

export const cancelLabJob = actionClient.inputSchema(cancelSchema).action(async ({ parsedInput }) => {
  return { cancelled: cancelJob(parsedInput.jobId) }
})

const deleteSchema = z.object({
  reportId: z.string().trim().min(8).max(64),
})

export const deleteLabReport = actionClient.inputSchema(deleteSchema).action(async ({ parsedInput }) => {
  const report = await loadReport(parsedInput.reportId)
  if (!report) return { ok: false as const, reason: "missing" as const }
  const ok = await verifyOwner(parsedInput.reportId, report.ownerToken)
  if (!ok) return { ok: false as const, reason: "forbidden" as const }
  await deleteReport(parsedInput.reportId)
  await clearOwnerCookie(parsedInput.reportId)
  return { ok: true as const }
})

export const canDeleteReport = actionClient.inputSchema(deleteSchema).action(async ({ parsedInput }) => {
  const report = await loadReport(parsedInput.reportId)
  if (!report?.ownerToken) return { canDelete: false }
  return { canDelete: await verifyOwner(parsedInput.reportId, report.ownerToken) }
})
