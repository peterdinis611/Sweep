import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises"
import path from "node:path"
import { cache } from "react"
import { deleteRawLhr } from "@/analysis/lhr-store"
import type { Report } from "@/analysis/types"

const DIR = path.join(process.cwd(), "data", "reports")
const ID_RE = /^[a-z0-9-]{8,64}$/i

function hostKey(url: string) {
  try {
    const u = new URL(url)
    return `${u.hostname}${u.pathname}`.replace(/\/$/, "").toLowerCase()
  } catch {
    return url.toLowerCase()
  }
}

export async function saveReport(report: Report) {
  await mkdir(DIR, { recursive: true })
  await writeFile(path.join(DIR, `${report.id}.json`), JSON.stringify(report), "utf8")
  void cleanupExpired().catch(() => undefined)
}

export const loadReport = cache(async (id: string): Promise<Report | null> => {
  if (!ID_RE.test(id)) return null
  try {
    const raw = await readFile(path.join(DIR, `${id}.json`), "utf8")
    return JSON.parse(raw) as Report
  } catch {
    return null
  }
})

/** Najnovší report pre rovnakú URL (bez aktuálneho id). */
export async function findLatestByUrl(url: string, excludeId?: string): Promise<Report | null> {
  const key = hostKey(url)
  let latest: Report | null = null
  try {
    const files = await readdir(DIR)
    for (const file of files) {
      if (!file.endsWith(".json")) continue
      const id = file.slice(0, -5)
      if (excludeId && id === excludeId) continue
      try {
        const raw = await readFile(path.join(DIR, file), "utf8")
        const report = JSON.parse(raw) as Report
        if (hostKey(report.finalUrl || report.url) !== key) continue
        if (!latest || report.createdAt > latest.createdAt) latest = report
      } catch {
        /* skip corrupt */
      }
    }
  } catch {
    return null
  }
  return latest
}

/** Same-host history for compare picker (newest first). */
export async function listReportsByUrl(url: string, excludeId?: string, limit = 12): Promise<Report[]> {
  const key = hostKey(url)
  const out: Report[] = []
  try {
    const files = await readdir(DIR)
    for (const file of files) {
      if (!file.endsWith(".json")) continue
      const id = file.slice(0, -5)
      if (excludeId && id === excludeId) continue
      try {
        const raw = await readFile(path.join(DIR, file), "utf8")
        const report = JSON.parse(raw) as Report
        if (hostKey(report.finalUrl || report.url) !== key) continue
        out.push(report)
      } catch {
        /* skip */
      }
    }
  } catch {
    return []
  }
  out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  return out.slice(0, limit)
}

export function reportTtlDays() {
  const ttl = Number(process.env.REPORT_TTL_DAYS ?? 14)
  return Number.isFinite(ttl) && ttl > 0 ? ttl : 14
}

export function expiresInDays(createdAt: string) {
  const ttl = reportTtlDays()
  const age = (Date.now() - new Date(createdAt).getTime()) / (24 * 60 * 60 * 1000)
  return Math.max(0, Math.ceil(ttl - age))
}

export async function listReports(limit = 40): Promise<Report[]> {
  const out: Report[] = []
  try {
    const files = await readdir(DIR)
    for (const file of files) {
      if (!file.endsWith(".json")) continue
      try {
        const raw = await readFile(path.join(DIR, file), "utf8")
        out.push(JSON.parse(raw) as Report)
      } catch {
        /* skip */
      }
    }
  } catch {
    return []
  }
  out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  return out.slice(0, limit)
}

export async function deleteReport(id: string): Promise<boolean> {
  if (!ID_RE.test(id)) return false
  try {
    await unlink(path.join(DIR, `${id}.json`))
    await deleteRawLhr(id)
    return true
  } catch {
    return false
  }
}

export async function cleanupExpired() {
  const ttl = Number(process.env.REPORT_TTL_DAYS ?? 14)
  if (!Number.isFinite(ttl) || ttl <= 0) return
  const cutoff = Date.now() - ttl * 24 * 60 * 60 * 1000
  try {
    const files = await readdir(DIR)
    await Promise.all(
      files.map(async (file) => {
        if (!file.endsWith(".json")) return
        const full = path.join(DIR, file)
        const id = file.slice(0, -5)
        try {
          const raw = await readFile(full, "utf8")
          const report = JSON.parse(raw) as Report
          if (new Date(report.createdAt).getTime() < cutoff) {
            await unlink(full)
            await deleteRawLhr(id)
          }
        } catch {
          /* ignore */
        }
      }),
    )
  } catch {
    /* dir missing */
  }
}
