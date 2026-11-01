import { cookies } from "next/headers"
import type { Report } from "@/analysis/types"

export const OWNER_COOKIE_PREFIX = "sweep-own-"

export function ownerCookieName(reportId: string) {
  return `${OWNER_COOKIE_PREFIX}${reportId}`
}

export function publicReport(report: Report): Report {
  const { ownerToken: _, ...rest } = report
  return rest
}

export async function setOwnerCookie(reportId: string, ownerToken: string) {
  const jar = await cookies()
  jar.set(ownerCookieName(reportId), ownerToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })
}

export async function clearOwnerCookie(reportId: string) {
  const jar = await cookies()
  jar.delete(ownerCookieName(reportId))
}

export async function verifyOwner(reportId: string, ownerToken: string | undefined): Promise<boolean> {
  if (!ownerToken) return false
  const jar = await cookies()
  const cookie = jar.get(ownerCookieName(reportId))?.value
  return Boolean(cookie && cookie === ownerToken)
}
