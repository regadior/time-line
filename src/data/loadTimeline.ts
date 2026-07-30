import type { ZodError } from 'zod'
import { TimelineSchema, type Timeline } from '@/domain/schema'

/** Thrown when `timeline.json` does not satisfy the schema. */
export class TimelineValidationError extends Error {
  readonly issues: ZodError['issues']

  constructor(error: ZodError) {
    const summary = error.issues
      .map((issue) => `· ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n')
    super(`El fichero timeline.json no cumple el esquema:\n${summary}`)
    this.name = 'TimelineValidationError'
    this.issues = error.issues
  }
}

/** Default location, honouring Vite's base path so it works on any deploy target. */
export function defaultTimelineUrl(): string {
  return `${import.meta.env.BASE_URL}data/timeline.json`
}

/** Fetch and validate the timeline JSON. Throws on network or schema errors. */
export async function loadTimeline(url: string = defaultTimelineUrl()): Promise<Timeline> {
  let response: Response
  try {
    response = await fetch(url)
  } catch (cause) {
    throw new Error(`No se pudo cargar ${url}`, { cause })
  }

  if (!response.ok) {
    throw new Error(`No se pudo cargar ${url} (HTTP ${response.status})`)
  }

  const json: unknown = await response.json()
  const result = TimelineSchema.safeParse(json)
  if (!result.success) {
    throw new TimelineValidationError(result.error)
  }

  return result.data
}
