import { z } from 'zod'

/**
 * Domain schema for the career timeline.
 *
 * The JSON in `public/data/timeline.json` is the single source of truth and is
 * validated against these schemas at load time. TypeScript types are *inferred*
 * from the schemas so the runtime contract and the compile-time types can never
 * drift apart.
 */

/** A calendar month, formatted `YYYY-MM` (e.g. `2026-07`). */
export const MonthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Se esperaba un mes con formato YYYY-MM')

/** Hex color like `#8250df`. */
export const HexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Se esperaba un color hex #rrggbb')

/**
 * A localizable string: either a plain string (language-neutral, e.g. a proper
 * noun) or `{ es, en }`. Spanish is required; English falls back to Spanish.
 */
export const LocalizedSchema = z.union([
  z.string().min(1),
  z.object({ es: z.string().min(1), en: z.string().min(1).optional() }),
])
export type Localized = z.infer<typeof LocalizedSchema>

export const LinkSchema = z.object({
  label: z.string().min(1),
  url: z.url(),
})

/**
 * A project = a feature branch inside a company. Its `commits` are the notable
 * activities/milestones. `end === null` means the project is still ongoing.
 */
export const ProjectSchema = z.object({
  id: z.string().min(1),
  name: LocalizedSchema,
  role: z.string().optional(),
  summary: LocalizedSchema.optional(),
  start: MonthSchema,
  end: MonthSchema.nullable(),
  commits: z.array(LocalizedSchema).default([]),
  tech: z.array(z.string().min(1)).default([]),
  tools: z.array(z.string().min(1)).default([]),
})

/**
 * A company = a long-lived branch off the trunk. `end === null` means it is the
 * current employer (the branch is not merged back yet — HEAD lives here).
 */
export const CompanySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.string().optional(),
  location: z.string().optional(),
  color: HexColorSchema.optional(),
  start: MonthSchema,
  end: MonthSchema.nullable(),
  projects: z.array(ProjectSchema).min(1),
})

export const ProfileSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional(),
  tagline: LocalizedSchema.optional(),
  location: z.string().optional(),
  email: z.email().optional(),
  links: z.array(LinkSchema).default([]),
  /** The trunk branch name — a wink to git (`main` or `develop`). */
  defaultBranch: z.enum(['main', 'develop']).default('main'),
})

export const TimelineSchema = z.object({
  profile: ProfileSchema,
  companies: z.array(CompanySchema).min(1),
})

export type Month = z.infer<typeof MonthSchema>
export type Link = z.infer<typeof LinkSchema>
export type Project = z.infer<typeof ProjectSchema>
export type Company = z.infer<typeof CompanySchema>
export type Profile = z.infer<typeof ProfileSchema>
export type Timeline = z.infer<typeof TimelineSchema>
