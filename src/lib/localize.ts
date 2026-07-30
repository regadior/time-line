import type { Localized } from '@/domain/schema'
import type { Lang } from '@/i18n/types'

/**
 * Resolve a localized value to a plain string for the requested language.
 * A plain string is language-neutral; an object falls back to `es` when the
 * requested language is missing.
 */
export function localize(value: Localized, lang: Lang): string {
  if (typeof value === 'string') return value
  return (lang === 'en' ? value.en : value.es) ?? value.es
}
