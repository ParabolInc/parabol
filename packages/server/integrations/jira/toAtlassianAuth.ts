import type {AtlassianAuth, TeamMemberIntegrationAuth} from '../../postgres/types'
import type {JiraAuthMeta} from './JiraOAuth2Manager'

const readCloudIds = (meta: unknown): string[] => {
  const cloudIds = (meta as Partial<JiraAuthMeta> | null)?.cloudIds
  return Array.isArray(cloudIds)
    ? cloudIds.filter((id): id is string => typeof id === 'string')
    : []
}

const toAtlassianAuth = (
  row: TeamMemberIntegrationAuth | null | undefined
): AtlassianAuth | null => {
  if (!row?.accessToken || !row.refreshToken || !row.providerUserId) return null
  return {
    ...row,
    accessToken: row.accessToken,
    refreshToken: row.refreshToken,
    scope: row.scopes ?? '',
    accountId: row.providerUserId,
    cloudIds: readCloudIds(row.meta)
  }
}

export default toAtlassianAuth
