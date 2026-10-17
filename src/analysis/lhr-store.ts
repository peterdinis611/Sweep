import { mkdir, readFile, unlink, writeFile, readdir } from "node:fs/promises"
import path from "node:path"

const DIR = path.join(process.cwd(), "data", "lhr")
const ID_RE = /^[a-z0-9-]{8,64}$/i

export async function saveRawLhr(reportId: string, strategy: "mobile" | "desktop", lhr: unknown) {
  await mkdir(DIR, { recursive: true })
  await writeFile(path.join(DIR, `${reportId}-${strategy}.json`), JSON.stringify(lhr), "utf8")
}

export async function loadRawLhr(reportId: string, strategy: "mobile" | "desktop"): Promise<unknown | null> {
  if (!ID_RE.test(reportId)) return null
  try {
    const raw = await readFile(path.join(DIR, `${reportId}-${strategy}.json`), "utf8")
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export async function hasRawLhr(reportId: string): Promise<boolean> {
  if (!ID_RE.test(reportId)) return false
  try {
    const files = await readdir(DIR)
    return files.some((f) => f.startsWith(`${reportId}-`) && f.endsWith(".json"))
  } catch {
    return false
  }
}

export async function deleteRawLhr(reportId: string) {
  if (!ID_RE.test(reportId)) return
  for (const strategy of ["mobile", "desktop"] as const) {
    try {
      await unlink(path.join(DIR, `${reportId}-${strategy}.json`))
    } catch {
      /* ignore */
    }
  }
}
