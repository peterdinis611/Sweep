import { RateLimiter } from "@tanstack/pacer"

const DEFAULT_LIMIT = Number(process.env.SWEEP_RATE_LIMIT ?? 8)
const DEFAULT_WINDOW_MS = Number(process.env.SWEEP_RATE_WINDOW_MS ?? 60_000)

/** Per-key sliding-window limiters (process-local; not distributed). */
const limiters = new Map<string, RateLimiter<() => void>>()

export class RateLimitError extends Error {
  constructor(message = "Too many requests. Try again in a minute.") {
    super(message)
    this.name = "RateLimitError"
  }
}

function resolveLimit(limit: number) {
  return Number.isFinite(limit) && limit > 0 ? limit : 8
}

function resolveWindow(windowMs: number) {
  return Number.isFinite(windowMs) && windowMs > 0 ? windowMs : 60_000
}

function getLimiter(key: string, limit: number, windowMs: number) {
  const existing = limiters.get(key)
  if (existing) {
    existing.setOptions({
      limit,
      window: windowMs,
      windowType: "sliding",
    })
    return existing
  }
  const limiter = new RateLimiter((): void => {}, {
    limit,
    window: windowMs,
    windowType: "sliding",
  })
  limiters.set(key, limiter)
  return limiter
}

/** Sliding-window limiter via TanStack Pacer (process-local). */
export function rateLimit(
  key: string,
  limit = DEFAULT_LIMIT,
  windowMs = DEFAULT_WINDOW_MS,
) {
  const max = resolveLimit(limit)
  const window = resolveWindow(windowMs)
  const limiter = getLimiter(key, max, window)
  if (!limiter.maybeExecute()) {
    const waitMs = limiter.getMsUntilNextWindow()
    const secs = Math.max(1, Math.ceil(waitMs / 1000))
    throw new RateLimitError(`Too many requests. Try again in ${secs}s.`)
  }
}

export function clientKey(ip: string | null | undefined, suffix: string) {
  return `${ip?.trim() || "unknown"}:${suffix}`
}

/** Test helper — drop cached limiter state for a key. */
export function resetRateLimit(key?: string) {
  if (!key) {
    for (const limiter of limiters.values()) limiter.reset()
    limiters.clear()
    return
  }
  const limiter = limiters.get(key)
  if (!limiter) return
  limiter.reset()
  limiters.delete(key)
}
