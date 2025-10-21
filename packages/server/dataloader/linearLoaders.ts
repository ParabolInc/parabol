import DataLoader from 'dataloader'
import LinearManager from '../integrations/linear/LinearManager'
import getLinearDimensionFieldMaps, {
  type LinearDimensionFieldMap
} from '../postgres/queries/getLinearDimensionFieldMaps'
import upsertTeamMemberIntegrationAuth from '../postgres/queries/upsertTeamMemberIntegrationAuth'
import type {TeamMemberIntegrationAuth} from '../postgres/types'
import logError from '../utils/logError'
import type RootDataLoader from './RootDataLoader'

/**
 * DataLoader that ensures Linear auth tokens are fresh (not expired).
 * Automatically refreshes tokens when they expire or are about to expire.
 * Follows the pattern established by freshGitlabAuth and freshGcalAuth.
 */
export const freshLinearAuth = (parent: RootDataLoader) => {
  return new DataLoader<{teamId: string; userId: string}, TeamMemberIntegrationAuth | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({teamId, userId}) => {
          // Load existing auth from database
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
            // Token is expired, attempt refresh
            if (!refreshToken) {
              // No refresh token available
              // This indicates an old token that never had refresh capabilities
              // Log the issue and return null (user must re-authenticate)
              logError(new Error('Linear auth expired without refresh token'), {userId})
              return null
            }

            // Load provider details for OAuth2 configuration
            const provider = await parent.get('integrationProviders').loadNonNull(providerId)
            const {clientId, clientSecret, serverBaseUrl} = provider

            // Create manager and refresh the token
            const manager = new LinearManager(clientId!, clientSecret!, serverBaseUrl!)
            const oauthRes = await manager.refresh(refreshToken)

            if (oauthRes instanceof Error) {
              // Refresh failed - log and return null
              logError(new Error(`Linear token refresh failed: ${oauthRes.message}`), {userId})
              return null
            }

            // Calculate new expiration time with buffer
            const {accessToken, refreshToken: newRefreshToken, expiresIn} = oauthRes
            const bufferBeforeExpires = 30 // seconds
            const millisecondsInSeconds = 1000
            const expiresAtTimestamp =
              new Date().getTime() +
              ((expiresIn ?? 86400) - bufferBeforeExpires) * millisecondsInSeconds
            const newExpiresAt = new Date(expiresAtTimestamp)

            // Update database with new tokens
            const newLinearAuth = {
              ...linearAuth,
              accessToken,
              refreshToken: newRefreshToken || refreshToken, // Use new or keep old
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

/**
 * DataLoader for Linear dimension field maps.
 * Maps estimation dimensions to Linear custom fields.
 */
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
