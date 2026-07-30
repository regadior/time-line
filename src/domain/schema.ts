import { z } from 'zod'

// The JSON in `public/data/timeline.json` is the single source of truth and is
// validated against these schemas at load time. The types below are *inferred*
// from them so the runtime contract and the compile-time types cannot drift.

export const MonthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Se esperaba un mes con formato YYYY-MM')

export const HexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Se esperaba un color hex #rrggbb')

/** A plain string is language-neutral; `en` falls back to `es` when missing. */
export const LocalizedSchema = z.union([
  z.string().min(1),
  z.object({ es: z.string().min(1), en: z.string().min(1).optional() }),
])
export type Localized = z.infer<typeof LocalizedSchema>

export const LinkSchema = z.object({
  label: z.string().min(1),
  url: z.url(),
})

/** A project is a feature branch inside a company; `end: null` means ongoing. */
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

/** A company is a long-lived branch; `end: null` means it is never merged back. */
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
