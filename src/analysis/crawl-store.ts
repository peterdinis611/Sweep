import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { cache } from "react"
import type { Crawl } from "@/analysis/types"

const DIR = path.join(process.cwd(), "data", "crawls")
const ID_RE = /^[a-z0-9-]{8,64}$/i

export async function saveCrawl(crawl: Crawl) {
  await mkdir(DIR, { recursive: true })
  await writeFile(path.join(DIR, `${crawl.id}.json`), JSON.stringify(crawl), "utf8")
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
