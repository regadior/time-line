import { useState } from 'react'
import type { Timeline } from '@/domain/schema'
import type { Selection } from '@/graph/model'
import { useI18n } from '@/i18n/context'
import type { Lang } from '@/i18n/types'
import { durationLabel, formatMonth, formatRange, monthsBetween } from '@/lib/dates'
import { localize } from '@/lib/localize'
import { TechBadge } from './TechBadge'

type StatKey = 'companies' | 'projects' | 'technologies' | 'experience'

interface OverviewStatsProps {
  timeline: Timeline
  now: Date
  onSelect: (selection: Selection | null) => void
}

interface Tile {
  key: StatKey
  value: string
  label: string
}

function techFrequency(timeline: Timeline): { name: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const company of timeline.companies) {
    for (const project of company.projects) {
      for (const tech of project.tech) {
        counts.set(tech, (counts.get(tech) ?? 0) + 1)
      }
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

function projectEntries(timeline: Timeline, lang: Lang) {
  return timeline.companies
    .flatMap((company) => company.projects.map((project) => ({ company, project })))
    .sort((a, b) => b.project.start.localeCompare(a.project.start))
    .map(({ project }) => ({
      id: project.id,
      name: localize(project.name, lang),
      range: formatRange(project.start, project.end, lang),
    }))
}

function Row({
  primary,
  secondary,
  color,
  onClick,
}: {
  primary: string
  secondary: string
  color?: string
  onClick?: () => void
}) {
  const inner = (
    <>
      <span className="flex min-w-0 items-center gap-2">
        {color && (
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          />
        )}
        <span className="truncate text-sm font-medium">{primary}</span>
      </span>
      <span className="shrink-0 text-xs text-muted">{secondary}</span>
    </>
  )
  const shape =
    'flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left'
  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className={`${shape} transition-colors hover:bg-surface-hover`}
    >
      {inner}
    </button>
  ) : (
    <div className={shape}>{inner}</div>
  )
}

export function OverviewStats({ timeline, now, onSelect }: OverviewStatsProps) {
  const { lang, t } = useI18n()
  const [open, setOpen] = useState<StatKey | null>('companies')

  const projects = projectEntries(timeline, lang)
  const technologies = techFrequency(timeline)
  const firstStart = [...timeline.companies.map((c) => c.start)].sort()[0] ?? '—'
  const totalMonths = monthsBetween(firstStart, null, now)

  const tiles: Tile[] = [
    {
      key: 'companies',
      value: String(timeline.companies.length),
      label: t.stats.companies,
    },
    { key: 'projects', value: String(projects.length), label: t.stats.projects },
    {
      key: 'technologies',
      value: String(technologies.length),
      label: t.stats.technologies,
    },
    {
      key: 'experience',
      value: durationLabel(totalMonths, lang),
      label: t.stats.experience,
    },
  ]

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {tiles.map((tile) => {
          const active = open === tile.key
          return (
            <button
              key={tile.key}
              type="button"
              onClick={() => setOpen(active ? null : tile.key)}
              aria-expanded={active}
              aria-controls="overview-stat-list"
              className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                active
                  ? 'border-accent bg-accent/10'
                  : 'border-border bg-surface hover:bg-surface-hover'
              }`}
            >
              <div className="text-lg font-semibold tabular-nums">{tile.value}</div>
              <div className={`text-xs ${active ? 'text-accent' : 'text-muted'}`}>
                {tile.label}
              </div>
            </button>
          )
        })}
      </div>

      {open && (
        <div id="overview-stat-list" className="rounded-lg border border-border p-1.5">
          {open === 'companies' && (
            <ul className="space-y-0.5">
              {timeline.companies.map((company) => (
                <li key={company.id}>
                  <Row
                    primary={company.name}
                    secondary={formatRange(company.start, company.end, lang)}
                    color="var(--accent)"
                    onClick={() =>
                      onSelect({ type: 'branch', branchId: `company:${company.id}` })
                    }
                  />
                </li>
              ))}
            </ul>
          )}

          {open === 'projects' && (
            <ul className="space-y-0.5">
              {projects.map((project) => (
                <li key={project.id}>
                  <Row
                    primary={project.name}
                    secondary={project.range}
                    onClick={() =>
                      onSelect({ type: 'branch', branchId: `project:${project.id}` })
                    }
                  />
                </li>
              ))}
            </ul>
          )}

          {open === 'technologies' && (
            <div className="flex flex-wrap gap-1.5 p-1">
              {technologies.map((tech) => (
                <TechBadge key={tech.name} label={tech.name} count={tech.count} />
              ))}
            </div>
          )}

          {open === 'experience' && (
            <ul className="space-y-0.5">
              <li>
                <Row primary={t.panel.since} secondary={formatMonth(firstStart, lang)} />
              </li>
              {timeline.companies.map((company) => (
                <li key={company.id}>
                  <Row
                    primary={company.name}
                    secondary={durationLabel(
                      monthsBetween(company.start, company.end, now),
                      lang,
                    )}
                    color="var(--accent)"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
