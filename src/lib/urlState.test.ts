import { describe, expect, it } from 'vitest'
import type { LaidOutBranch } from '@/graph/model'
import { parseUrlState, toSearch, validateSelection } from './urlState'

const branches = [
  { id: 'main', commits: [] },
  { id: 'company:plexus', commits: [] },
  { id: 'project:mobt', commits: [{ id: 'mobt:c0' }, { id: 'mobt:c1' }] },
] as unknown as LaidOutBranch[]

describe('parseUrlState', () => {
  it('reads nothing from an empty query', () => {
    expect(parseUrlState('')).toEqual({ selection: null, lang: null })
  })

  it('reads a project', () => {
    expect(parseUrlState('?project=mobt').selection).toEqual({
      type: 'branch',
      branchId: 'project:mobt',
    })
  })

  it('reads a company', () => {
    expect(parseUrlState('?company=plexus').selection).toEqual({
      type: 'branch',
      branchId: 'company:plexus',
    })
  })

  it('maps the 1-based commit number to its 0-based id', () => {
    expect(parseUrlState('?project=mobt&commit=3').selection).toEqual({
      type: 'commit',
      branchId: 'project:mobt',
      commitId: 'mobt:c2',
    })
  })

  it('ignores a commit that is not a positive integer', () => {
    for (const bad of ['0', '-1', 'abc', '']) {
      expect(parseUrlState(`?project=mobt&commit=${bad}`).selection).toEqual({
        type: 'branch',
        branchId: 'project:mobt',
      })
    }
  })

  it('prefers project over company when both are present', () => {
    expect(parseUrlState('?company=plexus&project=mobt').selection).toEqual({
      type: 'branch',
      branchId: 'project:mobt',
    })
  })

  it('reads a supported language and ignores anything else', () => {
    expect(parseUrlState('?lang=en').lang).toBe('en')
    expect(parseUrlState('?lang=es').lang).toBe('es')
    expect(parseUrlState('?lang=fr').lang).toBeNull()
  })
})

describe('toSearch', () => {
  it('round-trips every kind of selection', () => {
    const cases = [
      null,
      { type: 'branch', branchId: 'company:plexus' },
      { type: 'branch', branchId: 'project:mobt' },
      { type: 'commit', branchId: 'project:mobt', commitId: 'mobt:c2' },
    ] as const
    for (const selection of cases) {
      expect(parseUrlState(toSearch(selection, 'en')).selection).toEqual(selection)
    }
  })

  it('always pins the language so a shared link is deterministic', () => {
    expect(toSearch(null, 'es')).toBe('?lang=es')
    expect(parseUrlState(toSearch(null, 'en')).lang).toBe('en')
  })

  it('leaves the trunk out of the query', () => {
    expect(toSearch({ type: 'branch', branchId: 'main' }, 'es')).toBe('?lang=es')
  })
})

describe('validateSelection', () => {
  it('keeps a selection that exists', () => {
    const selection = { type: 'branch', branchId: 'project:mobt' } as const
    expect(validateSelection(branches, selection)).toEqual(selection)
  })

  it('drops a branch that is not in the graph', () => {
    expect(
      validateSelection(branches, { type: 'branch', branchId: 'project:ghost' }),
    ).toBeNull()
  })

  it('falls back to the branch when the commit is out of range', () => {
    expect(
      validateSelection(branches, {
        type: 'commit',
        branchId: 'project:mobt',
        commitId: 'mobt:c99',
      }),
    ).toEqual({ type: 'branch', branchId: 'project:mobt' })
  })
})
