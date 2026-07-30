import type { Profile } from '@/domain/schema'
import { useI18n } from '@/i18n/context'
import { localize } from '@/lib/localize'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.22-3.37-1.22-.46-1.18-1.11-1.5-1.11-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.34 1.12 2.91.86.09-.66.35-1.12.63-1.38-2.22-.26-4.55-1.14-4.55-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.4 9.4 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.33 4.79-4.56 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

export function ProfileHeader({ profile }: { profile: Profile }) {
  const { lang } = useI18n()
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-w-0 items-baseline gap-2">
            <h1 className="truncate text-base font-semibold sm:text-lg">{profile.name}</h1>
            {profile.role && (
              <span className="hidden truncate text-sm text-muted sm:inline">
                · {profile.role}
              </span>
            )}
          </div>
          {profile.tagline && (
            <p className="truncate text-xs text-muted">
              <span className="text-accent">$</span> {localize(profile.tagline, lang)}
            </p>
          )}
        </div>

        <nav className="flex shrink-0 items-center gap-1.5">
          {profile.links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noreferrer noopener"
              title={link.label}
              className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-surface text-muted transition-colors hover:bg-surface-hover hover:text-fg"
            >
              {link.label.toLowerCase() === 'github' ? <GitHubIcon /> : link.label}
            </a>
          ))}
          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              title={profile.email}
              className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-surface text-muted transition-colors hover:bg-surface-hover hover:text-fg"
            >
              <MailIcon />
            </a>
          )}
          <LanguageSwitcher />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
