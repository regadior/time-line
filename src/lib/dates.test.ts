import { describe, expect, it } from 'vitest'
import { durationLabel, formatMonth, formatRange, monthsBetween } from './dates'

describe('date formatting', () => {
  it('formats a month with year, per language', () => {
    expect(formatMonth('2023-08', 'es')).toContain('2023')
    expect(formatMonth('2023-08', 'en').toLowerCase()).toContain('aug')
  })

  it('formats an open range as actualidad / present', () => {
    expect(formatRange('2026-07', null, 'es')).toContain('actualidad')
    expect(formatRange('2026-07', null, 'en')).toContain('present')
    expect(formatRange('2023-08', '2023-09', 'es')).toContain('–')
  })

  it('counts whole months, closed and open', () => {
    expect(monthsBetween('2023-08', '2024-08', new Date(2026, 6, 15))).toBe(12)
    expect(monthsBetween('2026-07', null, new Date(2026, 6, 15))).toBe(0)
    expect(monthsBetween('2023-09', '2024-07', new Date(2026, 6, 15))).toBe(10)
  })

  it('renders a compact duration label per language', () => {
    expect(durationLabel(19, 'es')).toBe('1 a 7 m')
    expect(durationLabel(19, 'en')).toBe('1 y 7 mo')
    expect(durationLabel(12, 'es')).toBe('1 a')
    expect(durationLabel(5, 'en')).toBe('5 mo')
    expect(durationLabel(0, 'en')).toBe('0 mo')
  })
})
