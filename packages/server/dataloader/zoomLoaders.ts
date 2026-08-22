import DataLoader from 'dataloader'
import ZoomOAuth2Manager from '../integrations/zoom/ZoomOAuth2Manager'
import syncTeamMemberIntegrationAuthTokens from '../postgres/queries/syncTeamMemberIntegrationAuthTokens'
import type {TeamMemberIntegrationAuth} from '../postgres/types'
import logError from '../utils/logError'
import type RootDataLoader from './RootDataLoader'

export const freshZoomAuth = (parent: RootDataLoader) => {
  return new DataLoader<{teamId: string; userId: string}, TeamMemberIntegrationAuth | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({teamId, userId}) => {
          const zoomAuth = await parent
            .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
            .load({
              service: 'zoom',
              teamId,
              userId
            })
          if (!zoomAuth) return null
          const {expiresAt} = zoomAuth
          const now = new Date()
          if (expiresAt && expiresAt < now) {
            const {providerId, refreshToken} = zoomAuth
            if (!refreshToken) {
              logError(new Error('No refresh token in zoomAuth'), {userId})
              return null
            }
            const provider = await parent.get('integrationProviders').loadNonNull(providerId)
            const {clientId, clientSecret, serverBaseUrl} = provider
            const manager = new ZoomOAuth2Manager(clientId!, clientSecret!, serverBaseUrl!)
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
              refreshToken: zoomAuth.refreshToken,
              scopes: zoomAuth.scopes,
              expiresAt: newExpiresAt
            }
            await syncTeamMemberIntegrationAuthTokens({
              userId,
              teamId,
              providerId,
              providerUserId: zoomAuth.providerUserId,
              ...tokens
            })
            return {...zoomAuth, ...tokens}
          }
          return zoomAuth
        })
      )
      return results.map((result) => (result.status === 'fulfilled' ? result.value : null))
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({teamId, userId}) => `${userId}:${teamId}`
    }
  )
}
