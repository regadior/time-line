import type { Localized } from '@/domain/schema'
import type { Lang } from '@/i18n/types'

export function localize(value: Localized, lang: Lang): string {
  if (typeof value === 'string') return value
  return (lang === 'en' ? value.en : value.es) ?? value.es
}
