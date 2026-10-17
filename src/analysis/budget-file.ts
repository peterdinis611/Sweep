import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import type { Budget } from "@/analysis/types"
import { normalizeBudget } from "@/analysis/budget"

const FILE = path.join(process.cwd(), ".sweepbudget.json")

export async function loadProjectBudget(): Promise<Budget | null> {
  try {
    const raw = await readFile(FILE, "utf8")
    const parsed = JSON.parse(raw) as Partial<Budget>
    return normalizeBudget(parsed)
  } catch {
    return null
  }
}

export async function saveProjectBudget(budget: Partial<Budget>): Promise<Budget> {
  const normalized = normalizeBudget(budget)
  await writeFile(FILE, `${JSON.stringify(normalized, null, 2)}\n`, "utf8")
  return normalized
}

/** Form/CLI overrides win over project file; missing keys fall back to file then defaults. */
export async function resolveBudget(overrides?: Partial<Budget> | null): Promise<{
  budget: Budget
  fromFile: boolean
}> {
  const file = await loadProjectBudget()
  return {
    budget: normalizeBudget({ ...(file ?? {}), ...(overrides ?? {}) }),
    fromFile: Boolean(file),
  }
}
