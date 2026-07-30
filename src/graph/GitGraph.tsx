import { useEffect, useRef, type KeyboardEvent } from 'react'
import { useI18n } from '@/i18n/context'
import type { Lang } from '@/i18n/types'
import { formatRange } from '@/lib/dates'
import { localize } from '@/lib/localize'
import {
  buildBranchPath,
  COMMIT_RADIUS,
  contentHeight,
  graphWidth,
  GRID_OVERHANG,
  HEAD_RADIUS,
  LABEL_HEIGHT,
  LABEL_MIN_GAP,
  laneX,
  MARGIN,
  monthY,
  resolveLabelYs,
  yearTicks,
} from './geometry'
import type { LaidOutBranch, Selection, TimelineLayout } from './model'

interface GitGraphProps {
  layout: TimelineLayout
  selection: Selection | null
  onSelect: (selection: Selection | null) => void
}

function activateOnKey(handler: () => void) {
  return (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handler()
    }
  }
}

function tipPoint(branch: LaidOutBranch): { x: number; y: number } {
  const onOwnLane = branch.ongoing || branch.parentLane === null
  const lane = onOwnLane ? branch.lane : branch.parentLane
  return { x: laneX(lane ?? branch.lane), y: monthY(branch.endOffset) }
}

function branchTitle(branch: LaidOutBranch, lang: Lang): string {
  switch (branch.ref.kind) {
    case 'trunk':
      return branch.label
    case 'company':
      return branch.ref.company.name
    case 'project':
      return localize(branch.ref.project.name, lang)
  }
}

function branchSubtitle(branch: LaidOutBranch, lang: Lang): string {
  switch (branch.ref.kind) {
    case 'trunk':
      return 'HEAD'
    case 'company':
      return formatRange(branch.ref.company.start, branch.ref.company.end, lang)
    case 'project':
      return formatRange(branch.ref.project.start, branch.ref.project.end, lang)
  }
}

export function GitGraph({ layout, selection, onSelect }: GitGraphProps) {
  const { t, lang } = useI18n()
  const ticks = yearTicks(layout)
  const selectedBranchId = selection?.branchId ?? null

  const gridRight = laneX(layout.laneCount - 1) + GRID_OVERHANG
  const labelX = laneX(layout.laneCount - 1) + 34
  const tips = layout.branches.map(tipPoint)
  const labelYs = resolveLabelYs(
    tips.map((t) => t.y),
    LABEL_MIN_GAP,
  )
  const width = graphWidth(layout)
  const height = contentHeight(layout, labelYs)
  const nowY = monthY(layout.nowOffset)

  const focusRef = useRef<SVGGElement | null>(null)
  useEffect(() => {
    focusRef.current?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }, [selection])

  return (
    <div className="h-full w-full overflow-auto">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${t.graph.ariaLabel} · ${layout.trunkId}`}
        className="block"
      >
        <g aria-hidden="true">
          {ticks.map((tick) => (
            <g key={tick.year} className="text-muted">
              <line
                x1={MARGIN.left - 8}
                x2={gridRight}
                y1={tick.y}
                y2={tick.y}
                stroke="var(--border)"
                strokeWidth={1}
                strokeDasharray="2 4"
              />
              <text
                x={MARGIN.left - 16}
                y={tick.y}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-muted text-[11px] tabular-nums"
              >
                {tick.year}
              </text>
            </g>
          ))}
          <line
            x1={MARGIN.left - 8}
            x2={gridRight}
            y1={nowY}
            y2={nowY}
            stroke="var(--accent)"
            strokeWidth={1.5}
            strokeDasharray="1 5"
            opacity={0.7}
          />
          <text
            x={MARGIN.left - 16}
            y={nowY}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-accent text-[10px] font-semibold"
          >
            {t.graph.today}
          </text>
        </g>

        {layout.branches.map((branch) => {
          const dim = selectedBranchId !== null && branch.id !== selectedBranchId
          const parentX = branch.parentLane === null ? null : laneX(branch.parentLane)
          const path = buildBranchPath({
            parentX,
            x: laneX(branch.lane),
            startY: monthY(branch.startOffset),
            endY: monthY(branch.endOffset),
            merges: !branch.ongoing && branch.parentLane !== null,
          })
          const tip = tipPoint(branch)
          const isCompany = branch.kind === 'company'
          const isTrunk = branch.kind === 'trunk'
          return (
            <g key={branch.id} style={{ color: branch.color, opacity: dim ? 0.3 : 1 }}>
              <path
                d={path}
                fill="none"
                stroke="currentColor"
                strokeWidth={isCompany ? 3.25 : isTrunk ? 2.75 : 2.25}
                strokeLinecap="round"
              />
              <path
                className="branch-hit graph-node outline-none"
                d={path}
                fill="none"
                stroke="transparent"
                strokeWidth={18}
                role="button"
                tabIndex={0}
                aria-label={`${t.graph.branch} ${branchTitle(branch, lang)}`}
                onClick={() => onSelect({ type: 'branch', branchId: branch.id })}
                onKeyDown={activateOnKey(() =>
                  onSelect({ type: 'branch', branchId: branch.id }),
                )}
              >
                <title>{branchTitle(branch, lang)}</title>
              </path>
              {branch.ongoing || isTrunk ? (
                <circle
                  cx={tip.x}
                  cy={tip.y}
                  r={HEAD_RADIUS}
                  fill="var(--canvas)"
                  stroke="currentColor"
                  strokeWidth={3}
                />
              ) : (
                <circle cx={tip.x} cy={tip.y} r={COMMIT_RADIUS - 1} fill="currentColor" />
              )}
            </g>
          )
        })}

        {layout.branches.map((branch) => {
          const dim = selectedBranchId !== null && branch.id !== selectedBranchId
          return (
            <g key={`${branch.id}-commits`} style={{ color: branch.color }}>
              {branch.commits.map((commit) => {
                const active =
                  selection?.type === 'commit' && selection.commitId === commit.id
                return (
                  <g
                    key={commit.id}
                    ref={active ? focusRef : undefined}
                    className="graph-node outline-none"
                    role="button"
                    tabIndex={0}
                    aria-label={localize(commit.message, lang)}
                    style={{ opacity: dim ? 0.3 : 1 }}
                    onClick={() =>
                      onSelect({
                        type: 'commit',
                        branchId: branch.id,
                        commitId: commit.id,
                      })
                    }
                    onKeyDown={activateOnKey(() =>
                      onSelect({
                        type: 'commit',
                        branchId: branch.id,
                        commitId: commit.id,
                      }),
                    )}
                  >
                    <title>{localize(commit.message, lang)}</title>
                    <circle
                      className="commit-dot"
                      cx={laneX(branch.lane)}
                      cy={monthY(commit.monthOffset)}
                      r={active ? COMMIT_RADIUS + 2 : COMMIT_RADIUS}
                      fill={active ? 'currentColor' : 'var(--canvas)'}
                      stroke="currentColor"
                      strokeWidth={2.5}
                    />
                  </g>
                )
              })}
            </g>
          )
        })}

        {layout.branches.map((branch, i) => {
          const dim = selectedBranchId !== null && branch.id !== selectedBranchId
          const tip = tips[i] ?? { x: labelX, y: monthY(branch.endOffset) }
          const labelY = labelYs[i] ?? tip.y
          const selected = branch.id === selectedBranchId
          return (
            <g
              key={`${branch.id}-label`}
              ref={selected && selection?.type === 'branch' ? focusRef : undefined}
              style={{ opacity: dim ? 0.35 : 1 }}
            >
              <path
                d={`M ${tip.x} ${tip.y} L ${labelX - 6} ${labelY}`}
                fill="none"
                stroke="var(--border)"
                strokeWidth={1}
              />
              <foreignObject
                x={labelX}
                y={labelY - LABEL_HEIGHT / 2}
                width={MARGIN.right - 44}
                height={LABEL_HEIGHT}
              >
                <button
                  type="button"
                  onClick={() => onSelect({ type: 'branch', branchId: branch.id })}
                  className={`flex h-full w-full items-center gap-2 rounded-md px-1.5 text-left transition-colors hover:bg-surface-hover ${
                    selected ? 'bg-surface-hover' : ''
                  }`}
                >
                  <span
                    className="mt-0.5 size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: branch.color }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-[12.5px] leading-tight font-medium">
                      {branchTitle(branch, lang)}
                    </span>
                    <span className="block truncate text-[10.5px] leading-tight text-muted">
                      {branchSubtitle(branch, lang)}
                    </span>
                  </span>
                </button>
              </foreignObject>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
