import DataLoader from 'dataloader'
import GDriveOAuth2Manager from '../integrations/gdrive/GDriveOAuth2Manager'
import upsertTeamMemberIntegrationAuth from '../postgres/queries/upsertTeamMemberIntegrationAuth'
import type {TeamMemberIntegrationAuth} from '../postgres/types'
import logError from '../utils/logError'
import type RootDataLoader from './RootDataLoader'

export const freshGdriveAuth = (parent: RootDataLoader) => {
  return new DataLoader<{teamId: string; userId: string}, TeamMemberIntegrationAuth | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({teamId, userId}) => {
          const gdriveAuth = await parent
            .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
            .load({
              service: 'gdrive',
              teamId,
              userId
            })
          if (!gdriveAuth) return null
          const {expiresAt} = gdriveAuth
          const now = new Date()
          if (expiresAt && expiresAt < now) {
            const {providerId, refreshToken} = gdriveAuth
            if (!refreshToken) {
              logError(new Error('No refresh token in gdriveAuth'), {userId})
              return null
            }
            const provider = await parent.get('integrationProviders').loadNonNull(providerId)
            const {clientId, clientSecret, serverBaseUrl} = provider
            const manager = new GDriveOAuth2Manager(clientId!, clientSecret!, serverBaseUrl!)
            const oauthRes = await manager.refresh(refreshToken)
            if (oauthRes instanceof Error) return null
            const {accessToken, expiresIn} = oauthRes
            const bufferBeforeExpires = 30
            const millisecondsInSeconds = 1000
            const expiresAtTimestamp =
              new Date().getTime() + (expiresIn - bufferBeforeExpires) * millisecondsInSeconds
            const newExpiresAt = new Date(expiresAtTimestamp)
            const newGdriveAuth = {
              ...gdriveAuth,
              accessToken,
              refreshToken,
              expiresAt: newExpiresAt
            }
            await upsertTeamMemberIntegrationAuth(newGdriveAuth)
            return newGdriveAuth
          }
          return gdriveAuth
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
