import DataLoader from 'dataloader'
import LinearManager from '../integrations/linear/LinearManager'
import getLinearDimensionFieldMaps, {
  type LinearDimensionFieldMap
} from '../postgres/queries/getLinearDimensionFieldMaps'
import upsertTeamMemberIntegrationAuth from '../postgres/queries/upsertTeamMemberIntegrationAuth'
import type {TeamMemberIntegrationAuth} from '../postgres/types'
import logError from '../utils/logError'
import type RootDataLoader from './RootDataLoader'

export const freshLinearAuth = (parent: RootDataLoader) => {
  return new DataLoader<{teamId: string; userId: string}, TeamMemberIntegrationAuth | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({teamId, userId}) => {
          const linearAuth = await parent
            .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
            .load({
              service: 'linear',
              teamId,
              userId
            })

          if (!linearAuth) return null

          const {expiresAt, refreshToken, providerId} = linearAuth
          const now = new Date()

          // Check if token is expired or will expire soon
          if (expiresAt && expiresAt < now) {
            if (!refreshToken) {
              logError(new Error('Linear auth expired without refresh token'), {userId})
              return null
            }

            const provider = await parent.get('integrationProviders').loadNonNull(providerId)
            const {clientId, clientSecret, serverBaseUrl} = provider

            const manager = new LinearManager(clientId!, clientSecret!, serverBaseUrl!)
            const oauthRes = await manager.refresh(refreshToken)

            if (oauthRes instanceof Error) {
              logError(new Error(`Linear token refresh failed: ${oauthRes.message}`), {userId})
              return null
            }

            const {accessToken, refreshToken: newRefreshToken, expiresIn} = oauthRes
            const bufferBeforeExpires = 30 // seconds
            const millisecondsInSeconds = 1000
            const expiresAtTimestamp =
              new Date().getTime() +
              ((expiresIn ?? 86400) - bufferBeforeExpires) * millisecondsInSeconds
            const newExpiresAt = new Date(expiresAtTimestamp)

            const newLinearAuth = {
              ...linearAuth,
              accessToken,
              refreshToken: newRefreshToken || refreshToken,
              expiresAt: newExpiresAt
            }

            await upsertTeamMemberIntegrationAuth(newLinearAuth)
            return newLinearAuth
          }

          // Token is still valid
          return linearAuth
        })
      )

      // Map results, handling rejections as null
      const vals = results.map((result) => (result.status === 'fulfilled' ? result.value : null))
      return vals
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({teamId, userId}) => `${userId}:${teamId}`
    }
  )
}

export const linearDimensionFieldMaps = (parent: RootDataLoader) => {
  return new DataLoader<
    {teamId: string; dimensionName: string; repoId: string},
    LinearDimensionFieldMap | null,
    string
  >(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({teamId, dimensionName, repoId}) =>
          getLinearDimensionFieldMaps(teamId, dimensionName, repoId)
        )
      )
      const vals = results.map((result) => (result.status === 'fulfilled' ? result.value : null))
      return vals
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({teamId, dimensionName, repoId}) => `${teamId}:${dimensionName}:${repoId}`
    }
  )
}
