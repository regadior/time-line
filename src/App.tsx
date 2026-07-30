import { useMemo, useState } from 'react'
import { DetailPanel } from '@/components/DetailPanel'
import { Legend } from '@/components/Legend'
import { ProfileHeader } from '@/components/ProfileHeader'
import { GitGraph } from '@/graph/GitGraph'
import { computeTimelineLayout } from '@/graph/layout'
import type { Selection } from '@/graph/model'
import { useTimeline } from '@/hooks/useTimeline'
import { useI18n } from '@/i18n/context'
import { LanguageProvider } from '@/i18n/LanguageProvider'

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-dvh place-items-center p-6 text-sm text-muted">{children}</div>
}

function ErrorScreen({ error }: { error: Error }) {
  const { t } = useI18n()
  return (
    <Centered>
      <div className="max-w-lg space-y-3">
        <h1 className="text-base font-semibold text-fg">{t.app.errorTitle}</h1>
        <pre className="overflow-auto rounded-lg border border-border bg-surface p-3 text-xs whitespace-pre-wrap text-muted">
          {error.message}
        </pre>
        <p className="text-xs">
          {t.app.errorHintPrefix} <code className="text-accent">public/data/timeline.json</code>.
        </p>
      </div>
    </Centered>
  )
}

function AppInner() {
  const { t } = useI18n()
  const state = useTimeline()
  const now = useMemo(() => new Date(), [])
  const [selection, setSelection] = useState<Selection | null>(null)
  const layout = useMemo(
    () => (state.status === 'ready' ? computeTimelineLayout(state.data, { now }) : null),
    [state, now],
  )

  if (state.status === 'loading') return <Centered>{t.app.loading}</Centered>
  if (state.status === 'error') return <ErrorScreen error={state.error} />
  if (!layout) return null

  return (
    <div className="flex h-dvh flex-col">
      <ProfileHeader profile={state.data.profile} />
      <div className="mx-auto flex min-h-0 w-full max-w-[1500px] flex-1 flex-col lg:flex-row">
        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-3 border-b border-border px-4 py-2 sm:px-6">
            <Legend trunkName={layout.trunkId} />
          </div>
          <div className="min-h-0 flex-1 bg-canvas">
            <GitGraph layout={layout} selection={selection} onSelect={setSelection} />
          </div>
        </main>
        <div className="flex h-[42dvh] w-full shrink-0 flex-col border-t border-border bg-canvas lg:h-full lg:w-[380px] lg:border-l lg:border-t-0">
          <DetailPanel
            layout={layout}
            timeline={state.data}
            selection={selection}
            now={now}
            onSelect={setSelection}
          />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  )
}
