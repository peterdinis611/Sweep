import { lookup } from "node:dns/promises"
import { isIP } from "node:net"

const BLOCKED_HOSTS = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata.google.com",
  "169.254.169.254",
])

function isPrivateIpv4(ip: string) {
  const parts = ip.split(".").map(Number)
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false
  const [a, b] = parts as [number, number, number, number]
  if (a === 10) return true
  if (a === 127) return true
  if (a === 0) return true
  if (a === 169 && b === 254) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && b === 168) return true
  if (a === 100 && b >= 64 && b <= 127) return true // CGNAT
  return false
}

function isPrivateIpv6(ip: string) {
  const normalized = ip.toLowerCase()
  if (normalized === "::1" || normalized === "::") return true
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true // ULA
  if (normalized.startsWith("fe80")) return true // link-local
  return false
}

export function isBlockedIp(ip: string) {
  const version = isIP(ip)
  if (version === 4) return isPrivateIpv4(ip)
  if (version === 6) return isPrivateIpv6(ip)
  return false
}

/** Opt-in for measuring localhost / private nets (local lab). Default off in production. */
export function privateUrlsAllowed() {
  const v = process.env.SWEEP_ALLOW_PRIVATE_URLS?.trim().toLowerCase()
  if (v === "1" || v === "true") return true
  if (v === "0" || v === "false") return false
  return process.env.NODE_ENV !== "production"
}

/**
 * Reject localhost / private / link-local / cloud metadata targets.
 * Resolves DNS so hostname→private-IP tricks are blocked too.
 */
export async function assertPublicUrl(urlString: string) {
  if (privateUrlsAllowed()) return

  const url = new URL(urlString)
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http and https URLs are allowed.")
  }
  if (url.username || url.password) {
    throw new Error("URLs with credentials are not allowed.")
  }

  const host = url.hostname.toLowerCase().replace(/\.$/, "")
  if (BLOCKED_HOSTS.has(host) || host.endsWith(".localhost") || host.endsWith(".local")) {
    throw new Error("Private or local URLs are not allowed.")
  }

  if (isIP(host)) {
    if (isBlockedIp(host)) throw new Error("Private or local URLs are not allowed.")
    return
  }

  try {
    const results = await lookup(host, { all: true, verbatim: true })
    if (!results.length) throw new Error("Could not resolve host.")
    for (const r of results) {
      if (isBlockedIp(r.address)) {
        throw new Error("Private or local URLs are not allowed.")
      }
    }
  } catch (e) {
    if (e instanceof Error && e.message.includes("Private or local")) throw e
    throw new Error("Could not resolve host.")
  }
}
