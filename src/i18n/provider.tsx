"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import {
  DEFAULT_LOCALE,
  dictionaries,
  isLocale,
  LOCALE_COOKIE,
  type Locale,
  type Messages,
} from "./messages"

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Messages
}

const I18nContext = createContext<I18nContextValue | null>(null)

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE
  try {
    const stored = localStorage.getItem(LOCALE_COOKIE)
    if (isLocale(stored)) return stored
    const nav = navigator.language.toLowerCase()
    if (nav.startsWith("cs")) return "cs"
    if (nav.startsWith("en")) return "en"
    if (nav.startsWith("sk")) return "sk"
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE
}

function persistLocale(locale: Locale) {
  try {
    localStorage.setItem(LOCALE_COOKIE, locale)
    document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;samesite=lax`
    document.documentElement.lang = locale
  } catch {
    /* ignore */
  }
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const next = readStoredLocale()
    setLocaleState(next)
    persistLocale(next)
    setReady(true)
  }, [])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    persistLocale(next)
  }, [])

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: dictionaries[locale],
    }),
    [locale, setLocale],
  )

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used within LocaleProvider")
  return ctx
}
