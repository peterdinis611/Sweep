"use client"

import { useCallback, useEffect, useState } from "react"

function key(reportId: string) {
  return `sweep-fixed:${reportId}`
}

export function useOpportunityAnnotations(reportId: string) {
  const [fixed, setFixed] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key(reportId))
      if (!raw) {
        setFixed(new Set())
        return
      }
      const parsed = JSON.parse(raw) as string[]
      setFixed(new Set(parsed))
    } catch {
      setFixed(new Set())
    }
  }, [reportId])

  const toggle = useCallback(
    (opportunityId: string) => {
      setFixed((prev) => {
        const next = new Set(prev)
        if (next.has(opportunityId)) next.delete(opportunityId)
        else next.add(opportunityId)
        try {
          localStorage.setItem(key(reportId), JSON.stringify([...next]))
        } catch {
          /* ignore */
        }
        return next
      })
    },
    [reportId],
  )

  const isFixed = useCallback((id: string) => fixed.has(id), [fixed])

  return { isFixed, toggle, fixedCount: fixed.size }
}
