import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/** Report / crawl ids: 8–64 chars, alphanumeric + hyphen. */
const ID_RE = /^[a-z0-9-]{8,64}$/i

function applySecurityHeaders(res: NextResponse) {
  res.headers.set("X-Content-Type-Options", "nosniff")
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  res.headers.set("X-Frame-Options", "DENY")
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  return res
}

/**
 * Next.js 16+: `proxy` replaces deprecated `middleware`.
 * Invalid /r|/c ids → rewrite to branded 400 page with HTTP 400.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const match = pathname.match(/^\/(r|c)\/([^/]+)/)

  if (match && !ID_RE.test(match[2]!)) {
    const url = request.nextUrl.clone()
    url.pathname = "/400"
    url.search = ""
    url.searchParams.set("reason", "invalid-id")
    return applySecurityHeaders(NextResponse.rewrite(url, { status: 400 }))
  }

  return applySecurityHeaders(NextResponse.next())
}

export const config = {
  matcher: [
    "/r/:path*",
    "/c/:path*",
    "/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
