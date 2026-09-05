import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises"
import path from "node:path"
import { cache } from "react"
import type { Report } from "@/analysis/types"

const DIR = path.join(process.cwd(), "data", "reports")
const TTL_DAYS = Number(process.env.REPORT_TTL_DAYS ?? 14)
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

export async function cleanupExpired() {
  if (!Number.isFinite(TTL_DAYS) || TTL_DAYS <= 0) return
  const cutoff = Date.now() - TTL_DAYS * 24 * 60 * 60 * 1000
  try {
    const files = await readdir(DIR)
    await Promise.all(
      files.map(async (file) => {
        if (!file.endsWith(".json")) return
        const full = path.join(DIR, file)
        try {
          const raw = await readFile(full, "utf8")
          const report = JSON.parse(raw) as Report
          if (new Date(report.createdAt).getTime() < cutoff) await unlink(full)
        } catch {
          /* ignore */
        }
      }),
    )
  } catch {
    /* dir missing */
  }
}
