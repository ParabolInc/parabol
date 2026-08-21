import type {GitHubAuth, TeamMemberIntegrationAuth} from '../../postgres/types'

const toGitHubAuth = (row: TeamMemberIntegrationAuth | null | undefined): GitHubAuth | null => {
  if (row?.service !== 'github' || !row.accessToken || !row.providerUserId) return null
  return {
    ...row,
    service: 'github',
    accessToken: row.accessToken,
    scope: row.scopes ?? '',
    login: row.providerUserId
  }
}

export default toGitHubAuth
