import { describe, expect, it } from 'vitest'
import { localize } from '@/lib/localize'
import { translations } from './translations'

function deepKeys(obj: Record<string, unknown>): string[] {
  return Object.entries(obj)
    .flatMap(([key, value]) =>
      value && typeof value === 'object'
        ? Object.keys(value as object).map((sub) => `${key}.${sub}`)
        : [key],
    )
    .sort()
}

describe('localize', () => {
  it('returns a plain string unchanged', () => {
    expect(localize('MoBT', 'en')).toBe('MoBT')
    expect(localize('MoBT', 'es')).toBe('MoBT')
  })

  it('picks the requested language', () => {
    expect(localize({ es: 'hola', en: 'hi' }, 'en')).toBe('hi')
    expect(localize({ es: 'hola', en: 'hi' }, 'es')).toBe('hola')
  })

  it('falls back to Spanish when English is missing', () => {
    expect(localize({ es: 'hola' }, 'en')).toBe('hola')
  })
})

describe('translations', () => {
  it('define exactly the same keys in both languages', () => {
    expect(deepKeys(translations.en)).toEqual(deepKeys(translations.es))
  })
})
