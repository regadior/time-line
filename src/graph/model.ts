import type { Company, Localized, Project } from '@/domain/schema'

/**
 * The *layout model* — the git graph expressed in abstract coordinates:
 *   · `lane`  → an integer column (mapped to x by the renderer)
 *   · `t`     → a float offset in months from the global start (mapped to y)
 *
 * Keeping the layout resolution-independent lets it be a pure, unit-tested
 * function; only the renderer knows about pixels.
 */

export type BranchKind = 'trunk' | 'company' | 'project'

/** Discriminated back-reference to the domain object a branch represents. */
export type BranchRef =
  | { kind: 'trunk' }
  | { kind: 'company'; company: Company }
  | { kind: 'project'; company: Company; project: Project }

/** A commit dot — one notable activity/milestone of a project. */
export interface LaidOutCommit {
  id: string
  /** Offset along the time axis, in months from the global start. */
  t: number
  /** Localizable message; resolved to a string at render time. */
  message: Localized
}

/** A branch = the trunk, a company, or a project. */
export interface LaidOutBranch {
  id: string
  kind: BranchKind
  label: string
  lane: number
  /** CSS colour (a `var(--…)` reference, so it follows the theme). */
  color: string
  /** Fork point — months from global start. */
  start: number
  /** Tip / merge point — months from global start. */
  end: number
  /** `true` while the branch is not merged back (current company / project). */
  ongoing: boolean
  parentId: string | null
  parentLane: number | null
  commits: LaidOutCommit[]
  ref: BranchRef
}

/** What the user has selected in the graph (drives the detail panel). */
export type Selection =
  | { type: 'branch'; branchId: string }
  | { type: 'commit'; branchId: string; commitId: string }

export interface TimelineLayout {
  branches: LaidOutBranch[]
  /** Number of columns (lanes) in use. */
  laneCount: number
  /** Total timeline height, in whole months. */
  months: number
  /** First month on the axis, `YYYY-MM`. */
  startMonth: string
  /** Last month on the axis, `YYYY-MM`. */
  endMonth: string
  /** "Today" as a `t` offset — where the HEAD marker sits. */
  nowT: number
  /** Id of the trunk branch (`main` or `develop`). */
  trunkId: string
  defaultBranch: 'main' | 'develop'
}
