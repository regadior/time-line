import { describe, expect, it } from 'vitest'
import type { TimelineLayout } from './model'
import {
  buildBranchPath,
  LANE_WIDTH,
  laneX,
  MARGIN,
  monthY,
  resolveLabelYs,
  yearTicks,
} from './geometry'

describe('coordinate mapping', () => {
  it('maps lanes and months to pixels', () => {
    expect(laneX(0)).toBe(MARGIN.left)
    expect(laneX(3)).toBe(MARGIN.left + 3 * LANE_WIDTH)
    expect(monthY(0)).toBe(MARGIN.top)
  })
})

describe('buildBranchPath', () => {
  it('draws the trunk as a straight vertical line', () => {
    const path = buildBranchPath({ parentX: null, x: 64, startY: 56, endY: 500, merges: false })
    expect(path).toBe('M 64 56 L 64 500')
  })

  it('forks from the parent lane and stays open when ongoing', () => {
    const path = buildBranchPath({ parentX: 64, x: 124, startY: 100, endY: 400, merges: false })
    expect(path.startsWith('M 64 100')).toBe(true)
    expect(path).toContain('C') // has a fork curve
    // ends on the child lane (no merge back)
    expect(path.trimEnd().endsWith('124 400')).toBe(true)
  })

  it('merges back to the parent lane when finished', () => {
    const path = buildBranchPath({ parentX: 64, x: 124, startY: 100, endY: 400, merges: true })
    expect(path.startsWith('M 64 100')).toBe(true)
    // ends back on the parent lane
    expect(path.trimEnd().endsWith('64 400')).toBe(true)
  })
})

describe('resolveLabelYs', () => {
  it('pushes crowded labels apart while preserving association', () => {
    expect(resolveLabelYs([0, 5, 100], 26)).toEqual([0, 26, 100])
  })

  it('handles unsorted input, keeping each label with its index', () => {
    expect(resolveLabelYs([100, 0, 10], 26)).toEqual([100, 0, 26])
  })
})

describe('yearTicks', () => {
  it('emits a tick for each January inside the span', () => {
    const layout = { startMonth: '2023-08', months: 42 } as unknown as TimelineLayout
    const years = yearTicks(layout).map((t) => t.year)
    expect(years).toEqual([2024, 2025, 2026, 2027])
  })
})
