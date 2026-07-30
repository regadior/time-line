import type { Lang } from './types'

/**
 * UI string dictionary. `es` is the canonical shape; `en` is typed as
 * `Dictionary`, so the compiler flags any missing or extra key.
 */
const es = {
  app: {
    loading: 'Cargando timeline…',
    errorTitle: 'No se pudo cargar el timeline',
    errorHintPrefix: 'Revisa',
  },
  theme: {
    toLight: 'Cambiar a tema claro',
    toDark: 'Cambiar a tema oscuro',
  },
  language: {
    label: 'Idioma',
  },
  legend: {
    trunkHint: 'tu trayectoria',
    company: 'empresa',
    companyHint: 'rama',
    project: 'proyecto',
    projectHint: 'sub-rama',
    commit: 'commit',
    commitHint: 'hito',
  },
  graph: {
    ariaLabel: 'Git graph de la trayectoria profesional',
    today: 'hoy',
    branch: 'Rama',
  },
  panel: {
    close: 'Cerrar detalle',
    readme: 'README.md',
    overviewHint: 'Haz clic en una rama o en un commit del grafo para ver los detalles.',
    companies: 'Empresas',
    projects: 'Proyectos',
    stack: 'Stack',
    technologies: 'Tecnologías',
    tools: 'Herramientas',
    commits: 'Commits',
    branchCompany: 'rama · empresa',
    branchProject: 'rama · proyecto',
    company: 'Empresa',
    project: 'Proyecto',
    period: 'Periodo',
    active: 'activo',
    commitWord: 'commit',
  },
  stats: {
    companies: 'empresas',
    projects: 'proyectos',
    technologies: 'tecnologías',
    experience: 'experiencia',
  },
} as const

export type Dictionary = {
  [Group in keyof typeof es]: { [Key in keyof (typeof es)[Group]]: string }
}

const en: Dictionary = {
  app: {
    loading: 'Loading timeline…',
    errorTitle: 'Could not load the timeline',
    errorHintPrefix: 'Check',
  },
  theme: {
    toLight: 'Switch to light theme',
    toDark: 'Switch to dark theme',
  },
  language: {
    label: 'Language',
  },
  legend: {
    trunkHint: 'your career',
    company: 'company',
    companyHint: 'branch',
    project: 'project',
    projectHint: 'sub-branch',
    commit: 'commit',
    commitHint: 'milestone',
  },
  graph: {
    ariaLabel: 'Git graph of the professional career',
    today: 'today',
    branch: 'Branch',
  },
  panel: {
    close: 'Close details',
    readme: 'README.md',
    overviewHint: 'Click a branch or a commit in the graph to see the details.',
    companies: 'Companies',
    projects: 'Projects',
    stack: 'Stack',
    technologies: 'Technologies',
    tools: 'Tools',
    commits: 'Commits',
    branchCompany: 'branch · company',
    branchProject: 'branch · project',
    company: 'Company',
    project: 'Project',
    period: 'Period',
    active: 'active',
    commitWord: 'commit',
  },
  stats: {
    companies: 'companies',
    projects: 'projects',
    technologies: 'technologies',
    experience: 'experience',
  },
}

export const translations: Record<Lang, Dictionary> = { es, en }
