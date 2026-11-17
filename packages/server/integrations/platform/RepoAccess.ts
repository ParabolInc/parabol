import type {RepoAccessGrant, RepoAccessMeta} from '../../postgres/types/RepoAccessMeta'

const isGrant = (value: unknown): value is RepoAccessGrant =>
  typeof value === 'object' &&
  value !== null &&
  'id' in value &&
  typeof value.id === 'string' &&
  'name' in value &&
  typeof value.name === 'string'

/** Which of a user's repos/projects a team may reach through their connection */
export default class RepoAccess {
  static fromMeta(meta: unknown) {
    if (typeof meta !== 'object' || meta === null || !('repoAccess' in meta)) {
      return new RepoAccess('selected', [])
    }
    if (meta.repoAccess === 'all') return new RepoAccess('all', [])
    const repos = 'repos' in meta && Array.isArray(meta.repos) ? meta.repos.filter(isGrant) : []
    return new RepoAccess('selected', repos)
  }

  readonly mode: 'all' | 'selected'
  readonly repos: RepoAccessGrant[]
  private readonly grantedIds: Set<string>

  constructor(mode: 'all' | 'selected', repos: RepoAccessGrant[]) {
    this.mode = mode
    this.repos = mode === 'all' ? [] : repos
    this.grantedIds = new Set(this.repos.map(({id}) => id.toLowerCase()))
  }

  allows(integrationRepoId: string) {
    return this.mode === 'all' || this.grantedIds.has(integrationRepoId.toLowerCase())
  }

  toMeta(): RepoAccessMeta {
    return this.mode === 'all' ? {repoAccess: 'all'} : {repoAccess: 'selected', repos: this.repos}
  }
}
