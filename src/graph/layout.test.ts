import { describe, expect, it } from 'vitest'
import { TimelineSchema, type Timeline } from '@/domain/schema'
import timelineJson from '../../public/data/timeline.json'
import { absToMonth, computeTimelineLayout, monthToAbs, packLanes } from './layout'

const NOW = new Date('2026-07-15T00:00:00Z')

function makeTimeline(): Timeline {
  return TimelineSchema.parse({
    profile: { name: 'Test', defaultBranch: 'develop' },
    companies: [
      {
        id: 'acme',
        name: 'Acme',
        start: '2020-01',
        end: null,
        projects: [
          { id: 'a', name: 'A', start: '2020-01', end: '2020-06', commits: ['x', 'y'] },
          { id: 'b', name: 'B', start: '2020-06', end: '2021-01', commits: ['z'] },
          // Overlaps both A and B on the time axis.
          { id: 'c', name: 'C', start: '2020-03', end: '2020-09', commits: [] },
        ],
      },
    ],
  })
}

describe('month arithmetic', () => {
  it('round-trips YYYY-MM through an absolute index', () => {
    expect(monthToAbs('2020-01')).toBe(2020 * 12)
    expect(absToMonth(monthToAbs('2026-07'))).toBe('2026-07')
    expect(monthToAbs('2021-01') - monthToAbs('2020-01')).toBe(12)
  })
})

describe('packLanes', () => {
  it('reuses a lane for non-overlapping intervals and splits overlapping ones', () => {
    const lanes = packLanes([
      { id: 'x', start: 0, end: 2 },
      { id: 'y', start: 5, end: 7 }, // starts after x → shares lane 0
      { id: 'z', start: 1, end: 6 }, // overlaps both → lane 1
    ])
    expect(lanes.get('x')).toBe(0)
    expect(lanes.get('y')).toBe(0)
    expect(lanes.get('z')).toBe(1)
  })

  it('gives abutting intervals separate lanes', () => {
    const lanes = packLanes([
      { id: 'a', start: 0, end: 3 },
      { id: 'b', start: 3, end: 6 }, // end == start → not allowed to share
    ])
    expect(lanes.get('a')).toBe(0)
    expect(lanes.get('b')).toBe(1)
  })
})

describe('computeTimelineLayout', () => {
  const layout = computeTimelineLayout(makeTimeline(), { now: NOW })

  it('puts the trunk on lane 0 and honours the default branch name', () => {
    const trunk = layout.branches.find((b) => b.kind === 'trunk')
    expect(trunk?.lane).toBe(0)
    expect(trunk?.id).toBe('develop')
    expect(layout.trunkId).toBe('develop')
  })

  it('places companies on lane 1 and projects beyond them', () => {
    const company = layout.branches.find((b) => b.kind === 'company')
    expect(company?.lane).toBe(1)
    const projects = layout.branches.filter((b) => b.kind === 'project')
    expect(projects.every((p) => p.lane >= 2)).toBe(true)
  })

  it('packs time-overlapping projects onto distinct lanes', () => {
    const a = layout.branches.find((b) => b.id === 'project:a')
    const c = layout.branches.find((b) => b.id === 'project:c')
    expect(a?.lane).not.toBe(c?.lane)
  })

  it('flags ongoing branches and closed ones', () => {
    expect(layout.branches.find((b) => b.kind === 'company')?.ongoing).toBe(true)
    expect(layout.branches.find((b) => b.id === 'project:a')?.ongoing).toBe(false)
  })

  it('distributes commits in time order, strictly inside the branch span', () => {
    const a = layout.branches.find((b) => b.id === 'project:a')
    expect(a?.commits).toHaveLength(2)
    expect(a!.commits[0]!.t).toBeLessThan(a!.commits[1]!.t)
    for (const commit of a!.commits) {
      expect(commit.t).toBeGreaterThan(a!.start)
      expect(commit.t).toBeLessThan(a!.end)
    }
  })

  it('gives every project a distinct, stable colour', () => {
    const colors = layout.branches
      .filter((b) => b.kind === 'project')
      .map((b) => b.color)
    expect(new Set(colors).size).toBe(colors.length)
  })
})

describe('real timeline.json', () => {
  const layout = computeTimelineLayout(TimelineSchema.parse(timelineJson), { now: NOW })

  it('has seven project branches packed into a compact set of lanes', () => {
    expect(layout.branches.filter((b) => b.kind === 'project')).toHaveLength(7)
    expect(layout.laneCount).toBeLessThanOrEqual(6)
  })

  it('starts at the first Plexus month', () => {
    expect(layout.startMonth).toBe('2023-08')
  })

  it('keeps the three current projects ongoing', () => {
    const ongoing = layout.branches
      .filter((b) => b.kind === 'project' && b.ongoing)
      .map((b) => b.id)
    expect(ongoing).toEqual(
      expect.arrayContaining(['project:mobt', 'project:rm-api', 'project:global-api']),
    )
  })
})
