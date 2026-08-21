import type {AtlassianAuth, TeamMemberIntegrationAuth} from '../../postgres/types'

const toAtlassianAuth = (
  row: TeamMemberIntegrationAuth | null | undefined
): AtlassianAuth | null => {
  if (row?.service !== 'jira' || !row.accessToken || !row.refreshToken || !row.providerUserId)
    return null
  return {
    ...row,
    accessToken: row.accessToken,
    refreshToken: row.refreshToken,
    scope: row.scopes ?? '',
    accountId: row.providerUserId,
    cloudIds: row.meta.cloudIds
  }
}

export default toAtlassianAuth
