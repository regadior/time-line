import { describe, expect, it } from 'vitest'
import type { TimelineLayout } from './model'
import {
  buildBranchPath,
  contentHeight,
  graphHeight,
  LABEL_HEIGHT,
  LABEL_MIN_GAP,
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
    const path = buildBranchPath({
      parentX: null,
      x: 64,
      startY: 56,
      endY: 500,
      merges: false,
    })
    expect(path).toBe('M 64 56 L 64 500')
  })

  it('forks from the parent lane and stays open when ongoing', () => {
    const path = buildBranchPath({
      parentX: 64,
      x: 124,
      startY: 100,
      endY: 400,
      merges: false,
    })
    expect(path.startsWith('M 64 100')).toBe(true)
    expect(path.trimEnd().endsWith('124 400')).toBe(true)
  })

  it('merges back to the parent lane when finished', () => {
    const path = buildBranchPath({
      parentX: 64,
      x: 124,
      startY: 100,
      endY: 400,
      merges: true,
    })
    expect(path.startsWith('M 64 100')).toBe(true)
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

describe('label stacking', () => {
  it('separates labels by at least their own box height', () => {
    expect(LABEL_MIN_GAP).toBeGreaterThanOrEqual(LABEL_HEIGHT)
  })

  it('never leaves two resolved labels overlapping', () => {
    const coincident = [500, 500, 500, 500, 500]
    const resolved = resolveLabelYs(coincident, LABEL_MIN_GAP)
    const sorted = [...resolved].sort((a, b) => a - b)
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i]! - sorted[i - 1]!).toBeGreaterThanOrEqual(LABEL_HEIGHT)
    }
  })

  it('grows the canvas so the last stacked label is not clipped', () => {
    const layout = { startMonth: '2023-08', months: 42 } as unknown as TimelineLayout
    const pushedDown = graphHeight(layout) + 200
    expect(contentHeight(layout, [100, pushedDown])).toBeGreaterThan(pushedDown)
    expect(contentHeight(layout, [100, 200])).toBe(graphHeight(layout))
  })
})

describe('yearTicks', () => {
  it('emits a tick for each January inside the span', () => {
    const layout = { startMonth: '2023-08', months: 42 } as unknown as TimelineLayout
    const years = yearTicks(layout).map((t) => t.year)
    expect(years).toEqual([2024, 2025, 2026, 2027])
  })
})
