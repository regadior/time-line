import { useEffect, useState } from 'react'
import { loadTimeline } from '@/data/loadTimeline'
import type { Timeline } from '@/domain/schema'

export type TimelineState =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'ready'; data: Timeline }

/** Load and validate the timeline JSON once on mount. */
export function useTimeline(): TimelineState {
  const [state, setState] = useState<TimelineState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    loadTimeline()
      .then((data) => {
        if (!cancelled) setState({ status: 'ready', data })
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: 'error',
            error: error instanceof Error ? error : new Error(String(error)),
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
