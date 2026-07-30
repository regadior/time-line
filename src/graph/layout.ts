import type { Project, Timeline } from '@/domain/schema'
import { COMPANY_COLOR, projectColor, TRUNK_COLOR } from '@/lib/colors'
import { localize } from '@/lib/localize'
import type { LaidOutBranch, LaidOutCommit, TimelineLayout } from './model'

/** Minimum vertical room, in months, reserved per commit so dense/short
 *  projects still show their dots without overlapping. */
const MIN_COMMIT_SPAN_MONTHS = 0.85
/** Empty months kept below the newest activity for HEAD labels. */
const BOTTOM_PADDING_MONTHS = 2

export interface LayoutOptions {
  /** "Today" — injected so the layout stays a pure function (easy to test). */
  now: Date
}

/** `YYYY-MM` → absolute month index (`year * 12 + month0`). */
export function monthToAbs(month: string): number {
  const [year, month1] = month.split('-')
  return Number(year) * 12 + (Number(month1) - 1)
}

/** Absolute month index → `YYYY-MM`. */
export function absToMonth(abs: number): string {
  const year = Math.floor(abs / 12)
  const month1 = (abs % 12) + 1
  return `${year}-${String(month1).padStart(2, '0')}`
}

function dateToAbs(date: Date): number {
  return date.getFullYear() * 12 + date.getMonth()
}

interface LaneItem {
  id: string
  start: number
  end: number
}

/**
 * Greedy lane packing. An interval reuses a lane only if it starts strictly
 * after the last interval on that lane ends — so abutting intervals (one ending
 * the month another begins) get separate lanes and a fork never collides with a
 * merge at the same point.
 */
export function packLanes(items: readonly LaneItem[]): Map<string, number> {
  const ordered = [...items].sort((a, b) => a.start - b.start || a.end - b.end)
  const laneEnds: number[] = []
  const laneOf = new Map<string, number>()
  for (const item of ordered) {
    let lane = laneEnds.findIndex((end) => end < item.start)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(item.end)
    } else {
      laneEnds[lane] = item.end
    }
    laneOf.set(item.id, lane)
  }
  return laneOf
}

function laneCountOf(laneOf: Map<string, number>): number {
  let max = -1
  for (const lane of laneOf.values()) max = Math.max(max, lane)
  return max + 1
}

function distributeCommits(
  projectId: string,
  messages: Project['commits'],
  start: number,
  end: number,
): LaidOutCommit[] {
  const span = end - start
  return messages.map((message, i) => ({
    id: `${projectId}:c${i}`,
    t: start + ((i + 1) / (messages.length + 1)) * span,
    message,
  }))
}

/**
 * Turn the domain timeline into a laid-out git graph:
 *   trunk (lane 0) ← companies (lanes 1…) ← projects (lanes …),
 * with parallel projects packed into distinct lanes and each project's
 * activities distributed as commits along its branch.
 */
export function computeTimelineLayout(
  timeline: Timeline,
  options: LayoutOptions,
): TimelineLayout {
  const nowAbs = dateToAbs(options.now)
  const { companies } = timeline

  // Global start = earliest company/project start.
  const starts: number[] = []
  for (const company of companies) {
    starts.push(monthToAbs(company.start))
    for (const project of company.projects) starts.push(monthToAbs(project.start))
  }
  const startAbs = Math.min(...starts)

  // Flatten projects in chronological order → stable colours + lane packing.
  const projectEntries = companies
    .flatMap((company) => company.projects.map((project) => ({ company, project })))
    .sort((a, b) => monthToAbs(a.project.start) - monthToAbs(b.project.start))

  // Visual tip per project (absolute months), honouring the minimum commit span.
  const tipAbsById = new Map<string, number>()
  for (const { project } of projectEntries) {
    const startPos = monthToAbs(project.start)
    const rawTip = project.end ? monthToAbs(project.end) : nowAbs
    const minSpan = Math.max(1, project.commits.length * MIN_COMMIT_SPAN_MONTHS)
    tipAbsById.set(project.id, Math.max(rawTip, startPos + minSpan))
  }

  const globalEndAbs =
    Math.max(nowAbs, ...tipAbsById.values()) + BOTTOM_PADDING_MONTHS
  const months = Math.ceil(globalEndAbs - startAbs)

  // Lane assignment.
  const companyLaneOf = packLanes(
    companies.map((company) => ({
      id: company.id,
      start: monthToAbs(company.start),
      end: company.end ? monthToAbs(company.end) : globalEndAbs,
    })),
  )
  const projectLaneOf = packLanes(
    projectEntries.map(({ project }) => ({
      id: project.id,
      start: monthToAbs(project.start),
      end: tipAbsById.get(project.id) ?? monthToAbs(project.start),
    })),
  )

  const companyLaneBase = 1
  const projectLaneBase = companyLaneBase + laneCountOf(companyLaneOf)
  const laneCount = projectLaneBase + laneCountOf(projectLaneOf)

  const trunkId = timeline.profile.defaultBranch
  const rel = (abs: number) => abs - startAbs

  const branches: LaidOutBranch[] = []

  // Trunk.
  branches.push({
    id: trunkId,
    kind: 'trunk',
    label: trunkId,
    lane: 0,
    color: TRUNK_COLOR,
    start: 0,
    end: rel(globalEndAbs),
    ongoing: true,
    parentId: null,
    parentLane: null,
    commits: [],
    ref: { kind: 'trunk' },
  })

  // Companies.
  for (const company of companies) {
    const lane = companyLaneBase + (companyLaneOf.get(company.id) ?? 0)
    branches.push({
      id: `company:${company.id}`,
      kind: 'company',
      label: company.name,
      lane,
      color: COMPANY_COLOR,
      start: rel(monthToAbs(company.start)),
      end: rel(company.end ? monthToAbs(company.end) : globalEndAbs),
      ongoing: company.end === null,
      parentId: trunkId,
      parentLane: 0,
      commits: [],
      ref: { kind: 'company', company },
    })
  }

  // Projects.
  projectEntries.forEach(({ company, project }, index) => {
    const lane = projectLaneBase + (projectLaneOf.get(project.id) ?? 0)
    const parentLane = companyLaneBase + (companyLaneOf.get(company.id) ?? 0)
    const start = rel(monthToAbs(project.start))
    const end = rel(tipAbsById.get(project.id) ?? monthToAbs(project.start))
    branches.push({
      id: `project:${project.id}`,
      kind: 'project',
      label: localize(project.name, 'es'),
      lane,
      color: projectColor(index),
      start,
      end,
      ongoing: project.end === null,
      parentId: `company:${company.id}`,
      parentLane,
      commits: distributeCommits(project.id, project.commits, start, end),
      ref: { kind: 'project', company, project },
    })
  })

  return {
    branches,
    laneCount,
    months,
    startMonth: absToMonth(startAbs),
    endMonth: absToMonth(startAbs + months),
    nowT: rel(nowAbs),
    trunkId,
    defaultBranch: timeline.profile.defaultBranch,
  }
}
