import { describe, expect, it } from 'vitest'
import timeline from '../../public/data/timeline.json'
import { TimelineSchema } from './schema'

describe('timeline.json (datos reales)', () => {
  it('cumple el esquema del dominio', () => {
    const result = TimelineSchema.safeParse(timeline)
    expect(
      result.success,
      result.success ? '' : JSON.stringify(result.error.issues, null, 2),
    ).toBe(true)
  })

  it('todas las fechas de fin son posteriores o iguales a las de inicio', () => {
    const data = TimelineSchema.parse(timeline)
    for (const company of data.companies) {
      for (const project of company.projects) {
        if (project.end) {
          expect(project.end >= project.start, `${project.id}`).toBe(true)
        }
      }
    }
  })
})
