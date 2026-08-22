import type RootDataLoader from '../../dataloader/RootDataLoader'
import getKysely from '../../postgres/getKysely'
import syncTeamMemberIntegrationAuthTokens from '../../postgres/queries/syncTeamMemberIntegrationAuthTokens'
import type {AtlassianAuth} from '../../postgres/types'
import logError from '../../utils/logError'
import JiraOAuth2Manager from './JiraOAuth2Manager'

const refreshAtlassianAuth = async (
  dataLoader: RootDataLoader,
  auth: AtlassianAuth
): Promise<AtlassianAuth | null> => {
  const provider = await dataLoader.get('integrationProviders').loadNonNull(auth.providerId)
  const {clientId, clientSecret, serverBaseUrl} = provider
  if (!clientId || !clientSecret || !serverBaseUrl) {
    logError(new Error(`Jira provider ${auth.providerId} is missing OAuth2 credentials`), {
      userId: auth.userId,
      tags: {teamId: auth.teamId}
    })
    return null
  }
  const manager = new JiraOAuth2Manager(clientId, clientSecret, serverBaseUrl)
  const oauthRes = await manager.refresh(auth.refreshToken)
  if (oauthRes instanceof Error) {
    if (oauthRes.message === 'refresh_token is invalid') {
      await getKysely()
        .updateTable('TeamMemberIntegrationAuth')
        .set({isActive: false})
        .where('id', '=', auth.id)
        .execute()
      dataLoader.get('teamMemberIntegrationAuthsByServiceTeamAndUserId').clearAll()
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
  dataLoader.get('teamMemberIntegrationAuthsByServiceTeamAndUserId').clearAll()
  return {...auth, ...tokens, scope: tokens.scopes}
}

export default refreshAtlassianAuth
