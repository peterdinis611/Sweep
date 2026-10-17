import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises"
import path from "node:path"
import { cache } from "react"
import type { Crawl } from "@/analysis/types"

const DIR = path.join(process.cwd(), "data", "crawls")
const TTL_DAYS = Number(process.env.REPORT_TTL_DAYS ?? 14)
const ID_RE = /^[a-z0-9-]{8,64}$/i

export async function saveCrawl(crawl: Crawl) {
  await mkdir(DIR, { recursive: true })
  await writeFile(path.join(DIR, `${crawl.id}.json`), JSON.stringify(crawl), "utf8")
  void cleanupExpiredCrawls().catch(() => undefined)
}

export const loadCrawl = cache(async (id: string): Promise<Crawl | null> => {
  if (!ID_RE.test(id)) return null
  try {
    const raw = await readFile(path.join(DIR, `${id}.json`), "utf8")
    return JSON.parse(raw) as Crawl
  } catch {
    return null
  }
})

export async function listCrawls(limit = 40): Promise<Crawl[]> {
  const out: Crawl[] = []
  try {
    const files = await readdir(DIR)
    for (const file of files) {
      if (!file.endsWith(".json")) continue
      try {
        const raw = await readFile(path.join(DIR, file), "utf8")
        out.push(JSON.parse(raw) as Crawl)
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

export async function cleanupExpiredCrawls() {
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
          const crawl = JSON.parse(raw) as Crawl
          if (new Date(crawl.createdAt).getTime() < cutoff) await unlink(full)
        } catch {
          /* ignore */
        }
      }),
    )
  } catch {
    /* dir missing */
  }
}
