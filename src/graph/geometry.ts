import type { TimelineLayout } from './model'
import { monthToAbs } from './layout'

/**
 * Pixel geometry for the SVG renderer. Pure functions mapping the abstract
 * layout (lanes, month offsets) to coordinates and SVG path strings.
 */

export const MARGIN = { top: 56, right: 264, bottom: 72, left: 64 } as const
export const LANE_WIDTH = 60
export const MONTH_HEIGHT = 24
export const COMMIT_RADIUS = 6
export const HEAD_RADIUS = 8
/** Vertical distance over which a fork/merge curve eases across lanes. */
export const CURVE_HEIGHT = 18
/** Minimum vertical gap between stacked branch labels in the right gutter. */
export const LABEL_MIN_GAP = 26

const round = (n: number): string => (Number.isInteger(n) ? String(n) : n.toFixed(2))

export function laneX(lane: number): number {
  return MARGIN.left + lane * LANE_WIDTH
}

export function monthY(t: number): number {
  return MARGIN.top + t * MONTH_HEIGHT
}

export function graphWidth(layout: TimelineLayout): number {
  return laneX(Math.max(0, layout.laneCount - 1)) + MARGIN.right
}

export function graphHeight(layout: TimelineLayout): number {
  return monthY(layout.months) + MARGIN.bottom
}

export interface BranchPathInput {
  /** x of the parent lane, or null for the trunk (a straight line). */
  parentX: number | null
  x: number
  startY: number
  endY: number
  /** Whether the branch merges back into its parent at the end. */
  merges: boolean
}

/** Build the SVG path for a branch: fork curve → body → optional merge curve. */
export function buildBranchPath({
  parentX,
  x,
  startY,
  endY,
  merges,
}: BranchPathInput): string {
  if (parentX === null) {
    return `M ${round(x)} ${round(startY)} L ${round(x)} ${round(endY)}`
  }
  const curve = Math.min(CURVE_HEIGHT, Math.max(4, (endY - startY) / 2))
  const parts = [
    `M ${round(parentX)} ${round(startY)}`,
    `C ${round(parentX)} ${round(startY + curve / 2)}, ${round(x)} ${round(
      startY + curve / 2,
    )}, ${round(x)} ${round(startY + curve)}`,
  ]
  const bodyEnd = merges ? endY - curve : endY
  parts.push(`L ${round(x)} ${round(bodyEnd)}`)
  if (merges) {
    parts.push(
      `C ${round(x)} ${round(endY - curve / 2)}, ${round(parentX)} ${round(
        endY - curve / 2,
      )}, ${round(parentX)} ${round(endY)}`,
    )
  }
  return parts.join(' ')
}

/**
 * Resolve label y-positions so none sit closer than `minGap`, preserving input
 * order and nudging downward greedily. Used for the right-gutter branch labels.
 */
export function resolveLabelYs(desired: readonly number[], minGap: number): number[] {
  const order = desired.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y)
  let last = -Infinity
  for (const item of order) {
    if (item.y < last + minGap) item.y = last + minGap
    last = item.y
  }
  const out = new Array<number>(desired.length)
  for (const item of order) out[item.i] = item.y
  return out
}

export interface YearTick {
  year: number
  t: number
  y: number
}

/** Every January that falls inside the timeline, for horizontal gridlines. */
export function yearTicks(layout: TimelineLayout): YearTick[] {
  const startAbs = monthToAbs(layout.startMonth)
  const startYear = Math.ceil(startAbs / 12)
  const endYear = Math.floor((startAbs + layout.months) / 12)
  const ticks: YearTick[] = []
  for (let year = startYear; year <= endYear; year++) {
    const t = year * 12 - startAbs
    ticks.push({ year, t, y: monthY(t) })
  }
  return ticks
}
