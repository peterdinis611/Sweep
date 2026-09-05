"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { DEMO_REPORT, DEMO_REPORT_POOR } from "@/analysis/fixture"
import { normalizeUrl } from "@/analysis/pagespeed"
import { runAnalysis } from "@/analysis/run"
import { actionClient } from "@/server/safe-action"
import { saveReport } from "@/analysis/store"

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
})

export const analyzeSite = actionClient.inputSchema(analyzeSchema).action(async ({ parsedInput }) => {
  const report = await runAnalysis(normalizeUrl(parsedInput.url))
  redirect(`/r/${report.id}`)
})

const demoSchema = z.object({
  variant: z.enum(["mid", "poor"]).optional().default("mid"),
})

export const loadDemo = actionClient.inputSchema(demoSchema).action(async ({ parsedInput }) => {
  const base = parsedInput.variant === "poor" ? DEMO_REPORT_POOR : DEMO_REPORT
  const report = {
    ...base,
    id: `${base.id}-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  }
  await saveReport(report)
  redirect(`/r/${report.id}`)
})
