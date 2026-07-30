import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { parseUrlState } from '@/lib/urlState'
import { I18nContext, type I18nContextValue } from './context'
import { translations } from './translations'
import type { Lang } from './types'

const STORAGE_KEY = 'time-line:lang'

function getInitialLang(): Lang {
  const shared = parseUrlState(window.location.search).lang
  if (shared) return shared
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'es' || stored === 'en') return stored
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'es'
  return nav.toLowerCase().startsWith('en') ? 'en' : 'es'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    localStorage.setItem(STORAGE_KEY, lang)
  }, [lang])

  const setLang = useCallback((next: Lang) => setLangState(next), [])

  const value = useMemo<I18nContextValue>(
    () => ({ lang, setLang, t: translations[lang] }),
    [lang, setLang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
