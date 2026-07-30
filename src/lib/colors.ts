/**
 * Branch colours.
 *
 * The values live as CSS custom properties (`--branch-*`, `--trunk`, `--accent`)
 * so they swap automatically between the light and dark themes. The categorical
 * palette is the validated data-viz default (slots 1–6 + 8); violet is reserved
 * so it never clashes with the purple company accent.
 *
 * A couple of the light-mode slots sit in the CVD floor band / below 3:1 contrast,
 * which is only acceptable *with secondary encoding* — here every branch also
 * carries a distinct lane (position) and an always-visible text label.
 */

/** Trunk (`main` / `develop`) — the neutral backbone. */
export const TRUNK_COLOR = 'var(--trunk)'

/** Company branches — the brand accent. */
export const COMPANY_COLOR = 'var(--accent)'

/** Ordered categorical palette for project branches. */
export const PROJECT_PALETTE = [
  'var(--branch-1)',
  'var(--branch-2)',
  'var(--branch-3)',
  'var(--branch-4)',
  'var(--branch-5)',
  'var(--branch-6)',
  'var(--branch-8)',
] as const

/**
 * Pick a stable colour for the project at `index` in chronological order.
 * Colour follows the entity (its position in the timeline), never a filtered rank.
 */
export function projectColor(index: number): string {
  return PROJECT_PALETTE[index % PROJECT_PALETTE.length] ?? COMPANY_COLOR
}
