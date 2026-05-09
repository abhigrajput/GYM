"use client"

import { useCallback, useEffect, useState } from "react"
import type { Lang } from "@/lib/i18n/translations"
import { translate } from "@/lib/i18n/translations"

const STORAGE_KEY = "ironiq_lang"

function readLang(): Lang {
  if (typeof window === "undefined") return "en"
  const v = window.localStorage.getItem(STORAGE_KEY) as Lang | null
  if (v === "en") return v
  return "en"
}

export function useTranslation(profileLang?: string | null) {
  const [lang, setLangState] = useState<Lang>("en")

  useEffect(() => {
    const initial = profileLang === "en" ? "en" : readLang()
    setLangState(initial as Lang)
  }, [profileLang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {}
  }, [])

  const t = useCallback((key: string) => translate(lang, key), [lang])

  return { t, lang, setLang }
}
