import type { Lang } from '@/i18n/types'

/** Human-friendly formatting for `YYYY-MM` months, per language. */

const MONTH_FMT: Record<Lang, Intl.DateTimeFormat> = {
  es: new Intl.DateTimeFormat('es-ES', { month: 'short', year: 'numeric' }),
  en: new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }),
}

function toDate(month: string): Date {
  const [year, month1] = month.split('-')
  return new Date(Number(year), Number(month1) - 1, 1)
}

/** `2023-08` → `ago 2023` / `Aug 2023`. */
export function formatMonth(month: string, lang: Lang): string {
  return MONTH_FMT[lang].format(toDate(month))
}

/** A date range; an open end renders as `actualidad` / `present`. */
export function formatRange(start: string, end: string | null, lang: Lang): string {
  const present = lang === 'en' ? 'present' : 'actualidad'
  return `${formatMonth(start, lang)} – ${end ? formatMonth(end, lang) : present}`
}

/** Whole months between two `YYYY-MM` values (end defaults to `now`). */
export function monthsBetween(start: string, end: string | null, now: Date): number {
  const [sy, sm] = start.split('-').map(Number)
  const endYear = end ? Number(end.split('-')[0]) : now.getFullYear()
  const endMonth = end ? Number(end.split('-')[1]) - 1 : now.getMonth()
  return Math.max(0, (endYear - Number(sy)) * 12 + (endMonth - (Number(sm) - 1)))
}

/** `19` → `1 a 7 m` / `1 y 7 mo`; a compact duration label from a month count. */
export function durationLabel(months: number, lang: Lang): string {
  const yearUnit = lang === 'en' ? 'y' : 'a'
  const monthUnit = lang === 'en' ? 'mo' : 'm'
  const years = Math.floor(months / 12)
  const rest = months % 12
  const parts: string[] = []
  if (years > 0) parts.push(`${years} ${yearUnit}`)
  if (rest > 0) parts.push(`${rest} ${monthUnit}`)
  return parts.join(' ') || `0 ${monthUnit}`
}
