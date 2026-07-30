interface TechBadgeProps {
  label: string
  tone?: 'tech' | 'tool'
}

/** A small pill for a technology or tool. */
export function TechBadge({ label, tone = 'tech' }: TechBadgeProps) {
  const styles =
    tone === 'tech'
      ? 'border-accent/30 bg-accent/10 text-accent'
      : 'border-border bg-surface text-muted'
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] leading-5 ${styles}`}
    >
      {label}
    </span>
  )
}
