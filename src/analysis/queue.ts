import type { ProgressPhase } from "@/analysis/types"
import { clearJobProgress, setJobProgress } from "@/analysis/progress"

const MAX_QUEUE = Number(process.env.SWEEP_MAX_QUEUE ?? 8)
const controllers = new Map<string, AbortController>()
let depth = 0
let tail: Promise<unknown> = Promise.resolve()

export class QueueFullError extends Error {
  constructor() {
    super("Lab queue is full. Try again in a moment.")
    this.name = "QueueFullError"
  }
}

export class JobCancelledError extends Error {
  constructor() {
    super("Measurement cancelled.")
    this.name = "JobCancelledError"
  }
}

/** Run without the serial queue (e.g. crawl child URLs). Still supports cancel via jobId. */
export async function runCancellable<T>(
  jobId: string | undefined,
  fn: (signal: AbortSignal) => Promise<T>,
  parent?: AbortSignal,
): Promise<T> {
  const ac = new AbortController()
  if (jobId) controllers.set(jobId, ac)
  const onParent = () => ac.abort()
  parent?.addEventListener("abort", onParent)
  if (parent?.aborted) ac.abort()
  try {
    if (ac.signal.aborted) throw new JobCancelledError()
    return await fn(ac.signal)
  } finally {
    parent?.removeEventListener("abort", onParent)
    if (jobId) controllers.delete(jobId)
  }
}

export function enqueueJob<T>(jobId: string | undefined, fn: (signal: AbortSignal) => Promise<T>): Promise<T> {
  if (depth >= MAX_QUEUE) throw new QueueFullError()

  const ac = new AbortController()
  if (jobId) controllers.set(jobId, ac)
  depth += 1

  const run = tail.then(
    async () => {
      if (ac.signal.aborted) throw new JobCancelledError()
      return fn(ac.signal)
    },
    async () => {
      if (ac.signal.aborted) throw new JobCancelledError()
      return fn(ac.signal)
    },
  )

  tail = run.then(
    () => undefined,
    () => undefined,
  )

  return run.finally(() => {
    depth = Math.max(0, depth - 1)
    if (jobId) controllers.delete(jobId)
  })
}

export function cancelJob(jobId: string): boolean {
  const ac = controllers.get(jobId)
  if (!ac) return false
  ac.abort()
  setJobProgress(jobId, { phase: "cancelled" as ProgressPhase, pct: 0 })
  // Keep a brief cancelled marker, then clear
  setTimeout(() => clearJobProgress(jobId), 4000)
  return true
}

export function queueDepth() {
  return depth
}

export function queueLimit() {
  return Number.isFinite(MAX_QUEUE) && MAX_QUEUE > 0 ? MAX_QUEUE : 8
}
