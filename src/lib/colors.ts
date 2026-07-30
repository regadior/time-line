// Values live as CSS custom properties so they follow the active theme. The
// palette is the validated data-viz categorical default; a couple of its light
// steps sit in the colour-blindness warning band, which is only acceptable
// because every branch also carries a distinct lane and a text label — identity
// never depends on colour alone.

export const TRUNK_COLOR = 'var(--trunk)'

export const COMPANY_COLOR = 'var(--accent)'

export const PROJECT_PALETTE = [
  'var(--branch-1)',
  'var(--branch-2)',
  'var(--branch-3)',
  'var(--branch-4)',
  'var(--branch-5)',
  'var(--branch-6)',
  'var(--branch-8)',
] as const

/** Colour follows the project's chronological position, never a filtered rank. */
export function projectColor(index: number): string {
  return PROJECT_PALETTE[index % PROJECT_PALETTE.length] ?? COMPANY_COLOR
}
