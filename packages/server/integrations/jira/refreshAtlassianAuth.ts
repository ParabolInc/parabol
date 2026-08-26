import getKysely from '../../postgres/getKysely'
import syncTeamMemberIntegrationAuthTokens from '../../postgres/queries/syncTeamMemberIntegrationAuthTokens'
import type {AtlassianAuth} from '../../postgres/types'
import type {IntegrationProviderJiraOAuth2} from '../../postgres/types/IntegrationProvider'
import logError from '../../utils/logError'
import JiraOAuth2Manager from './JiraOAuth2Manager'

const refreshAtlassianAuth = async (
  auth: AtlassianAuth,
  provider: IntegrationProviderJiraOAuth2
): Promise<AtlassianAuth | null> => {
  const {clientId, clientSecret, serverBaseUrl} = provider
  const manager = new JiraOAuth2Manager(clientId, clientSecret, serverBaseUrl)
  const oauthRes = await manager.refresh(auth.refreshToken)
  if (oauthRes instanceof Error) {
    if (oauthRes.message === 'refresh_token is invalid') {
      await getKysely()
        .updateTable('TeamMemberIntegrationAuth')
        .set({isActive: false})
        .where('id', '=', auth.id)
        .execute()
    }
    logError(oauthRes)
    return null
  }
  const {accessToken, refreshToken, scopes, expiresIn} = oauthRes
  const expiresAt = expiresIn ? new Date(Date.now() + (expiresIn - 30) * 1000) : null
  const tokens = {
    accessToken,
    refreshToken: refreshToken ?? auth.refreshToken,
    scopes: scopes ?? auth.scope,
    expiresAt
  }
  await syncTeamMemberIntegrationAuthTokens({
    userId: auth.userId,
    teamId: auth.teamId,
    providerId: auth.providerId,
    providerUserId: auth.accountId,
    ...tokens
  })
  return {...auth, ...tokens, scope: tokens.scopes}
}

export default refreshAtlassianAuth
