import type { ProgressPhase } from "@/analysis/types"

export type JobProgress = {
  phase: ProgressPhase
  pct: number
  url?: string
  current?: number
  total?: number
  updatedAt: number
}

const jobs = new Map<string, JobProgress>()
const TTL_MS = 10 * 60 * 1000

export function setJobProgress(
  jobId: string | undefined,
  patch: {
    phase: ProgressPhase
    pct: number
    url?: string
    current?: number
    total?: number
  },
) {
  if (!jobId) return
  const prev = jobs.get(jobId)
  jobs.set(jobId, {
    current: patch.current ?? prev?.current,
    total: patch.total ?? prev?.total,
    url: patch.url ?? prev?.url,
    phase: patch.phase,
    pct: patch.pct,
    updatedAt: Date.now(),
  })
}

export function getJobProgress(jobId: string): JobProgress | null {
  const job = jobs.get(jobId)
  if (!job) return null
  if (Date.now() - job.updatedAt > TTL_MS) {
    jobs.delete(jobId)
    return null
  }
  return job
}

export function clearJobProgress(jobId: string | undefined) {
  if (!jobId) return
  jobs.delete(jobId)
}
