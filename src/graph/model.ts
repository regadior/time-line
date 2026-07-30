import type { Company, Localized, Project } from '@/domain/schema'

// Coordinates are resolution-independent: `lane` is an integer column and every
// `*Offset` is a number of months from the start of the timeline. Only the
// renderer turns them into pixels.

export type BranchKind = 'trunk' | 'company' | 'project'

export type BranchRef =
  | { kind: 'trunk' }
  | { kind: 'company'; company: Company }
  | { kind: 'project'; company: Company; project: Project }

export interface LaidOutCommit {
  id: string
  monthOffset: number
  message: Localized
}

export interface LaidOutBranch {
  id: string
  kind: BranchKind
  label: string
  lane: number
  color: string
  startOffset: number
  endOffset: number
  ongoing: boolean
  parentId: string | null
  parentLane: number | null
  commits: LaidOutCommit[]
  ref: BranchRef
}

export type Selection =
  | { type: 'branch'; branchId: string }
  | { type: 'commit'; branchId: string; commitId: string }

export interface TimelineLayout {
  branches: LaidOutBranch[]
  laneCount: number
  months: number
  startMonth: string
  endMonth: string
  nowOffset: number
  trunkId: string
  defaultBranch: 'main' | 'develop'
}
