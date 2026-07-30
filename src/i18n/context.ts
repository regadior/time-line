import { createContext, useContext } from 'react'
import type { Dictionary } from './translations'
import type { Lang } from './types'

export interface I18nContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  /** UI strings for the active language. */
  t: Dictionary
}

export const I18nContext = createContext<I18nContextValue | null>(null)

export function useI18n(): I18nContextValue {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n debe usarse dentro de <LanguageProvider>')
  return value
}
