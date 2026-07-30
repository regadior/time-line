interface TechBadgeProps {
  label: string
  tone?: 'tech' | 'tool'
  count?: number
}

export function TechBadge({ label, tone = 'tech', count }: TechBadgeProps) {
  const styles =
    tone === 'tech'
      ? 'border-accent/30 bg-accent/10 text-accent'
      : 'border-border bg-surface text-muted'
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] leading-5 ${styles}`}
    >
      {label}
      {count !== undefined && count > 1 && (
        <span className="ml-1 opacity-60 tabular-nums">×{count}</span>
      )}
    </span>
  )
}
