import type { LaidOutBranch, Selection } from '@/graph/model'
import type { Lang } from '@/i18n/types'

const COMPANY_PREFIX = 'company:'
const PROJECT_PREFIX = 'project:'

export interface UrlState {
  selection: Selection | null
  lang: Lang | null
}

export function parseUrlState(search: string): UrlState {
  const params = new URLSearchParams(search)

  const langParam = params.get('lang')
  const lang = langParam === 'es' || langParam === 'en' ? langParam : null

  const project = params.get('project')
  if (project) {
    const branchId = `${PROJECT_PREFIX}${project}`
    const commitParam = params.get('commit')
    const commitNumber = commitParam === null ? Number.NaN : Number(commitParam)
    if (Number.isInteger(commitNumber) && commitNumber > 0) {
      return {
        selection: {
          type: 'commit',
          branchId,
          commitId: `${project}:c${commitNumber - 1}`,
        },
        lang,
      }
    }
    return { selection: { type: 'branch', branchId }, lang }
  }

  const company = params.get('company')
  if (company) {
    return {
      selection: { type: 'branch', branchId: `${COMPANY_PREFIX}${company}` },
      lang,
    }
  }

  return { selection: null, lang }
}

export function toSearch(selection: Selection | null, lang: Lang): string {
  const params = new URLSearchParams()

  if (selection?.branchId.startsWith(PROJECT_PREFIX)) {
    params.set('project', selection.branchId.slice(PROJECT_PREFIX.length))
    if (selection.type === 'commit') {
      const index = Number(selection.commitId.split(':c')[1])
      if (Number.isInteger(index)) params.set('commit', String(index + 1))
    }
  } else if (selection?.branchId.startsWith(COMPANY_PREFIX)) {
    params.set('company', selection.branchId.slice(COMPANY_PREFIX.length))
  }

  params.set('lang', lang)
  return `?${params.toString()}`
}

/** A shared link can name something that no longer exists; degrade instead of breaking. */
export function validateSelection(
  branches: readonly LaidOutBranch[],
  selection: Selection | null,
): Selection | null {
  if (!selection) return null
  const branch = branches.find((candidate) => candidate.id === selection.branchId)
  if (!branch) return null
  if (
    selection.type === 'commit' &&
    !branch.commits.some((commit) => commit.id === selection.commitId)
  ) {
    return { type: 'branch', branchId: branch.id }
  }
  return selection
}
