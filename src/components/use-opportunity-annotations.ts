"use client"

import { useCallback, useEffect, useState } from "react"

function storageKey(host: string) {
  return `sweep-fixed-host:${host}`
}

function hostOf(url: string) {
  try {
    return new URL(url.includes("://") ? url : `https://${url}`).hostname.toLowerCase()
  } catch {
    return url.toLowerCase()
  }
}

/** Annotations keyed by host + opportunity id — survives re-measure. */
export function useOpportunityAnnotations(reportId: string, reportUrl?: string) {
  const host = hostOf(reportUrl || reportId)
  const [fixed, setFixed] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      // migrate legacy report-scoped keys once
      const legacy = localStorage.getItem(`sweep-fixed:${reportId}`)
      const raw = localStorage.getItem(storageKey(host))
      const fromHost = raw ? (JSON.parse(raw) as string[]) : []
      const fromLegacy = legacy ? (JSON.parse(legacy) as string[]) : []
      const merged = new Set([...fromHost, ...fromLegacy])
      setFixed(merged)
      if (fromLegacy.length && !raw) {
        localStorage.setItem(storageKey(host), JSON.stringify([...merged]))
      }
    } catch {
      setFixed(new Set())
    }
  }, [host, reportId])

  const toggle = useCallback(
    (opportunityId: string) => {
      setFixed((prev) => {
        const next = new Set(prev)
        if (next.has(opportunityId)) next.delete(opportunityId)
        else next.add(opportunityId)
        try {
          localStorage.setItem(storageKey(host), JSON.stringify([...next]))
        } catch {
          /* ignore */
        }
        return next
      })
    },
    [host],
  )

  const isFixed = useCallback((id: string) => fixed.has(id), [fixed])

  return { isFixed, toggle, fixedCount: fixed.size }
}
