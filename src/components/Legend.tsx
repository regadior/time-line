import { useI18n } from '@/i18n/context'

interface LegendItem {
  swatch: 'line' | 'dot'
  color: string
  label: string
  hint: string
}

/** Compact explainer of the git metaphor. */
export function Legend({ trunkName }: { trunkName: string }) {
  const { t } = useI18n()
  const items: LegendItem[] = [
    { swatch: 'line', color: 'var(--trunk)', label: trunkName, hint: t.legend.trunkHint },
    { swatch: 'line', color: 'var(--accent)', label: t.legend.company, hint: t.legend.companyHint },
    { swatch: 'line', color: 'var(--branch-1)', label: t.legend.project, hint: t.legend.projectHint },
    { swatch: 'dot', color: 'var(--branch-1)', label: t.legend.commit, hint: t.legend.commitHint },
  ]
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          {item.swatch === 'line' ? (
            <span
              className="inline-block h-[3px] w-4 rounded-full"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
          ) : (
            <span
              className="inline-block size-2.5 rounded-full border-2 bg-canvas"
              style={{ borderColor: item.color }}
              aria-hidden="true"
            />
          )}
          <span className="font-medium">{item.label}</span>
          <span className="text-muted">{item.hint}</span>
        </li>
      ))}
    </ul>
  )
}
