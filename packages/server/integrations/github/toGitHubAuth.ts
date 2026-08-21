import type {GitHubAuth, TeamMemberIntegrationAuth} from '../../postgres/types'

const toGitHubAuth = (row: TeamMemberIntegrationAuth | null | undefined): GitHubAuth | null => {
  if (!row?.accessToken || !row.providerUserId) return null
  return {...row, accessToken: row.accessToken, scope: row.scopes ?? '', login: row.providerUserId}
}

export default toGitHubAuth
