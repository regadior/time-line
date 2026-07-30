import { useI18n } from '@/i18n/context'
import { LANGS } from '@/i18n/types'

/** Compact ES · EN segmented control. */
export function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n()
  return (
    <div
      role="group"
      aria-label={t.language.label}
      className="inline-flex items-center rounded-md border border-border bg-surface p-0.5 text-xs font-semibold"
    >
      {LANGS.map((option) => {
        const active = option === lang
        return (
          <button
            key={option}
            type="button"
            onClick={() => setLang(option)}
            aria-pressed={active}
            className={`rounded px-2 py-1 uppercase transition-colors ${
              active ? 'bg-accent text-accent-fg' : 'text-muted hover:text-fg'
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
