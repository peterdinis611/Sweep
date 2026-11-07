type Bucket = { timestamps: number[] }

const buckets = new Map<string, Bucket>()

const DEFAULT_LIMIT = Number(process.env.SWEEP_RATE_LIMIT ?? 8)
const DEFAULT_WINDOW_MS = Number(process.env.SWEEP_RATE_WINDOW_MS ?? 60_000)

export class RateLimitError extends Error {
  constructor(message = "Too many requests. Try again in a minute.") {
    super(message)
    this.name = "RateLimitError"
  }
}

/** Simple sliding-window limiter (process-local). */
export function rateLimit(
  key: string,
  limit = DEFAULT_LIMIT,
  windowMs = DEFAULT_WINDOW_MS,
) {
  const max = Number.isFinite(limit) && limit > 0 ? limit : 8
  const window = Number.isFinite(windowMs) && windowMs > 0 ? windowMs : 60_000
  const now = Date.now()
  const bucket = buckets.get(key) ?? { timestamps: [] }
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < window)
  if (bucket.timestamps.length >= max) {
    throw new RateLimitError()
  }
  bucket.timestamps.push(now)
  buckets.set(key, bucket)
}

export function clientKey(ip: string | null | undefined, suffix: string) {
  return `${ip?.trim() || "unknown"}:${suffix}`
}
