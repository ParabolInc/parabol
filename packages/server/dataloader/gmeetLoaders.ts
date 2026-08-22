import DataLoader from 'dataloader'
import GmeetOAuth2Manager from '../integrations/gmeet/GmeetOAuth2Manager'
import syncTeamMemberIntegrationAuthTokens from '../postgres/queries/syncTeamMemberIntegrationAuthTokens'
import type {TeamMemberIntegrationAuth} from '../postgres/types'
import logError from '../utils/logError'
import type RootDataLoader from './RootDataLoader'

export const freshGmeetAuth = (parent: RootDataLoader) => {
  return new DataLoader<{teamId: string; userId: string}, TeamMemberIntegrationAuth | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({teamId, userId}) => {
          const gmeetAuth = await parent
            .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
            .load({
              service: 'gmeet',
              teamId,
              userId
            })
          if (!gmeetAuth) return null
          const {expiresAt} = gmeetAuth
          const now = new Date()
          if (expiresAt && expiresAt < now) {
            const {providerId, refreshToken} = gmeetAuth
            if (!refreshToken) {
              logError(new Error('No refresh token in gmeetAuth'), {userId})
              return null
            }
            const provider = await parent.get('integrationProviders').loadNonNull(providerId)
            const {clientId, clientSecret, serverBaseUrl} = provider
            const manager = new GmeetOAuth2Manager(clientId!, clientSecret!, serverBaseUrl!)
            const oauthRes = await manager.refresh(refreshToken)
            if (oauthRes instanceof Error) return null
            const {accessToken, expiresIn} = oauthRes
            const bufferBeforeExpires = 30
            const millisecondsInSeconds = 1000
            const expiresAtTimestamp =
              new Date().getTime() + (expiresIn - bufferBeforeExpires) * millisecondsInSeconds
            const newExpiresAt = new Date(expiresAtTimestamp)
            const tokens = {
              accessToken,
              refreshToken,
              scopes: gmeetAuth.scopes,
              expiresAt: newExpiresAt
            }
            await syncTeamMemberIntegrationAuthTokens({
              userId,
              teamId,
              providerId,
              providerUserId: gmeetAuth.providerUserId,
              ...tokens
            })
            return {...gmeetAuth, ...tokens}
          }
          return gmeetAuth
        })
      )
      const vals = results.map((result) => (result.status === 'fulfilled' ? result.value : null))
      return vals
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({teamId, userId}) => `${userId}:${teamId}`
    }
  )
}
