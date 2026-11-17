export interface RepoAccessGrant {
  /** What the service's RepoListCapability.integrationRepoId returns for the repo */
  id: string
  /** The label as of the last save, so the grant renders without a remote call */
  name: string
}

/** What a service with the repoAccess capability stores in TeamMemberIntegrationAuth.meta. A null meta is a connection that has not chosen yet, and reaches nothing */
export type RepoAccessMeta =
  | {repoAccess: 'all'}
  | {repoAccess: 'selected'; repos: RepoAccessGrant[]}
