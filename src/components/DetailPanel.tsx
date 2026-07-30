import type { ReactNode } from 'react'
import type { Company, Project, Timeline } from '@/domain/schema'
import type { LaidOutBranch, Selection, TimelineLayout } from '@/graph/model'
import { useI18n } from '@/i18n/context'
import { durationLabel, formatRange, monthsBetween } from '@/lib/dates'
import { shortHash } from '@/lib/hash'
import { localize } from '@/lib/localize'
import { OverviewStats } from './OverviewStats'
import { TechBadge } from './TechBadge'

interface DetailPanelProps {
  layout: TimelineLayout
  timeline: Timeline
  selection: Selection | null
  now: Date
  onSelect: (selection: Selection | null) => void
}

function uniqueTech(projects: readonly Project[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const project of projects) {
    for (const tech of project.tech) {
      if (!seen.has(tech)) {
        seen.add(tech)
        out.push(tech)
      }
    }
  }
  return out
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
      {children}
    </p>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-border pt-4">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
        {title}
      </h3>
      {children}
    </section>
  )
}

function DateLine({ start, end, now }: { start: string; end: string | null; now: Date }) {
  const { lang, t } = useI18n()
  return (
    <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted">
      <span>{formatRange(start, end, lang)}</span>
      <span aria-hidden="true">·</span>
      <span className="tabular-nums">
        {durationLabel(monthsBetween(start, end, now), lang)}
      </span>
      {end === null && (
        <span className="rounded-full bg-success/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-success">
          {t.panel.active}
        </span>
      )}
    </p>
  )
}

function Overview({
  timeline,
  now,
  onSelect,
}: {
  timeline: Timeline
  now: Date
  onSelect: (s: Selection | null) => void
}) {
  const { t } = useI18n()
  const { profile } = timeline

  return (
    <div className="space-y-5">
      <div>
        <Eyebrow>{t.panel.readme}</Eyebrow>
        <h2 className="mt-1 text-xl font-semibold">{profile.name}</h2>
        {profile.role && <p className="text-sm text-muted">{profile.role}</p>}
      </div>

      <OverviewStats timeline={timeline} now={now} onSelect={onSelect} />

      <p className="rounded-lg border border-dashed border-border px-3 py-2.5 text-xs text-muted">
        {t.panel.overviewHint}
      </p>
    </div>
  )
}

function CompanyDetail({
  company,
  color,
  now,
  onSelect,
}: {
  company: Company
  color: string
  now: Date
  onSelect: (s: Selection | null) => void
}) {
  const { lang, t } = useI18n()
  return (
    <div className="space-y-5">
      <div>
        <Eyebrow>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
            {t.panel.branchCompany}
          </span>
        </Eyebrow>
        <h2 className="mt-1 text-xl font-semibold">{company.name}</h2>
        {company.role && <p className="text-sm text-muted">{company.role}</p>}
        <DateLine start={company.start} end={company.end} now={now} />
      </div>

      <Section title={`${t.panel.projects} · ${company.projects.length}`}>
        <ul className="space-y-1">
          {company.projects.map((project) => (
            <li key={project.id}>
              <button
                type="button"
                onClick={() =>
                  onSelect({ type: 'branch', branchId: `project:${project.id}` })
                }
                className="w-full rounded-md px-2 py-1.5 text-left transition-colors hover:bg-surface-hover"
              >
                <span className="block truncate text-sm font-medium">
                  {localize(project.name, lang)}
                </span>
                <span className="block text-xs text-muted">
                  {formatRange(project.start, project.end, lang)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t.panel.stack}>
        <div className="flex flex-wrap gap-1.5">
          {uniqueTech(company.projects).map((tech) => (
            <TechBadge key={tech} label={tech} />
          ))}
        </div>
      </Section>
    </div>
  )
}

function ProjectDetail({
  company,
  project,
  branch,
  now,
  onSelect,
}: {
  company: Company
  project: Project
  branch: LaidOutBranch
  now: Date
  onSelect: (s: Selection | null) => void
}) {
  const { lang, t } = useI18n()
  return (
    <div className="space-y-5">
      <div>
        <Eyebrow>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: branch.color }}
            />
            {t.panel.branchProject}
          </span>
        </Eyebrow>
        <h2 className="mt-1 text-lg font-semibold leading-snug">
          {localize(project.name, lang)}
        </h2>
        <button
          type="button"
          onClick={() => onSelect({ type: 'branch', branchId: `company:${company.id}` })}
          className="text-sm text-accent hover:underline"
        >
          {company.name}
        </button>
        {project.role && <span className="text-sm text-muted"> · {project.role}</span>}
        <DateLine start={project.start} end={project.end} now={now} />
      </div>

      {project.summary && (
        <p className="text-sm leading-relaxed">{localize(project.summary, lang)}</p>
      )}

      {project.commits.length > 0 && (
        <Section title={`${t.panel.commits} · ${project.commits.length}`}>
          <ul className="space-y-0.5">
            {project.commits.map((message, index) => {
              const commitId = `${project.id}:c${index}`
              return (
                <li key={commitId}>
                  <button
                    type="button"
                    onClick={() =>
                      onSelect({ type: 'commit', branchId: branch.id, commitId })
                    }
                    className="flex w-full gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-surface-hover"
                  >
                    <code className="mt-0.5 shrink-0 text-[11px] text-muted">
                      {shortHash(commitId)}
                    </code>
                    <span className="text-sm leading-snug">
                      {localize(message, lang)}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </Section>
      )}

      {project.tech.length > 0 && (
        <Section title={t.panel.technologies}>
          <div className="flex flex-wrap gap-1.5">
            {project.tech.map((tech) => (
              <TechBadge key={tech} label={tech} />
            ))}
          </div>
        </Section>
      )}

      {project.tools.length > 0 && (
        <Section title={t.panel.tools}>
          <div className="flex flex-wrap gap-1.5">
            {project.tools.map((tool) => (
              <TechBadge key={tool} label={tool} tone="tool" />
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}

function CommitDetail({
  branch,
  company,
  project,
  commitId,
  message,
  onSelect,
}: {
  branch: LaidOutBranch
  company: Company
  project: Project
  commitId: string
  message: string
  onSelect: (s: Selection | null) => void
}) {
  const { lang, t } = useI18n()
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => onSelect({ type: 'branch', branchId: branch.id })}
        className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
      >
        ← {localize(project.name, lang)}
      </button>

      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="mb-2 flex items-center gap-2">
          <span
            className="size-3 rounded-full border-2 bg-canvas"
            style={{ borderColor: branch.color }}
          />
          <code className="text-xs text-muted">
            {t.panel.commitWord} {shortHash(commitId)}
          </code>
        </div>
        <p className="text-sm leading-relaxed">{message}</p>
      </div>

      <dl className="space-y-1 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">{t.panel.company}</dt>
          <dd className="text-right font-medium">{company.name}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">{t.panel.project}</dt>
          <dd className="text-right font-medium">{localize(project.name, lang)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">{t.panel.period}</dt>
          <dd className="text-right">{formatRange(project.start, project.end, lang)}</dd>
        </div>
      </dl>
    </div>
  )
}

export function DetailPanel({
  layout,
  timeline,
  selection,
  now,
  onSelect,
}: DetailPanelProps) {
  const { lang, t } = useI18n()
  const branch = selection
    ? layout.branches.find((b) => b.id === selection.branchId)
    : undefined

  let body: ReactNode
  if (!selection || !branch || branch.ref.kind === 'trunk') {
    body = <Overview timeline={timeline} now={now} onSelect={onSelect} />
  } else if (branch.ref.kind === 'company') {
    body = (
      <CompanyDetail
        company={branch.ref.company}
        color={branch.color}
        now={now}
        onSelect={onSelect}
      />
    )
  } else if (selection.type === 'commit') {
    const index = Number(selection.commitId.split(':c')[1] ?? 0)
    const message = localize(branch.ref.project.commits[index] ?? '', lang)
    body = (
      <CommitDetail
        branch={branch}
        company={branch.ref.company}
        project={branch.ref.project}
        commitId={selection.commitId}
        message={message}
        onSelect={onSelect}
      />
    )
  } else {
    body = (
      <ProjectDetail
        company={branch.ref.company}
        project={branch.ref.project}
        branch={branch}
        now={now}
        onSelect={onSelect}
      />
    )
  }

  const showClose = Boolean(selection)

  return (
    <aside className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted">
          <span className="text-accent">$</span>
          <code>{selection ? 'git show' : 'git status'}</code>
        </div>
        {showClose && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            aria-label={t.panel.close}
            className="inline-flex size-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-hover hover:text-fg"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-4">{body}</div>
    </aside>
  )
}
