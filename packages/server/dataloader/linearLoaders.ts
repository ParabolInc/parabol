import DataLoader from 'dataloader'
import LinearOAuth2Manager from '../integrations/linear/LinearOAuth2Manager'
import upsertTeamMemberIntegrationAuth from '../postgres/queries/upsertTeamMemberIntegrationAuth'
import {TeamMemberIntegrationAuth} from '../postgres/types'
import sendToSentry from '../utils/sendToSentry'
import RootDataLoader from './RootDataLoader'

// Dataloader to get fresh Linear auth tokens, refreshing if necessary
export const freshLinearAuth = (parent: RootDataLoader) => {
  // Define the key type inline, similar to other loaders
  return new DataLoader<{teamId: string; userId: string}, TeamMemberIntegrationAuth | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({teamId, userId}) => {
          try {
            const linearAuth = await parent
              .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
              .load({
                service: 'linear',
                teamId,
                userId
              })

            if (!linearAuth) return null

            const {expiresAt, refreshToken} = linearAuth
            const now = new Date()

            // Check if token is expired (or close to expiry, e.g., within 60 seconds)
            if (expiresAt && refreshToken && expiresAt.getTime() < now.getTime() + 60000) {
              const manager = new LinearOAuth2Manager()
              const oauthRes = await manager.refresh(refreshToken)

              if (oauthRes instanceof Error) {
                sendToSentry(oauthRes, {
                  userId,
                  tags: {dataloader: 'freshLinearAuth', stage: 'refresh'},
                  extras: {teamId}
                })
                // Decide if we should delete the auth or just return null
                // For now, return null, forcing re-auth
                return null
              }

              const {accessToken, refreshToken: newRefreshToken, expiresIn} = oauthRes
              // Calculate expiry time (Linear expiresIn is in seconds)
              // Subtract 30 seconds buffer like in GitLab loader
              const expiresAtTimestamp = new Date().getTime() + (expiresIn - 30) * 1000
              const newExpiresAt = new Date(expiresAtTimestamp)

              // Ensure the object conforms to ITeamMemberIntegrationAuthOAuth2Input
              const upsertData = {
                ...linearAuth,
                accessToken: accessToken, // This should always be non-null from a successful refresh
                refreshToken: newRefreshToken || '', // Provide empty string if null
                expiresAt: newExpiresAt,
                scopes: oauthRes.scope || '', // Provide scope from response or empty string
                service: 'linear' as const // Ensure service is correctly typed
              }

              // Save the updated auth details, ensuring type compatibility
              await upsertTeamMemberIntegrationAuth(upsertData)
              return upsertData // Return the data object we created
            }

            // Token is still valid or doesn't have a refresh token
            return linearAuth
          } catch (error: any) {
            sendToSentry(error, {
              userId,
              tags: {dataloader: 'freshLinearAuth', stage: 'loadOrRefresh'},
              extras: {teamId}
            })
            return null // Return null on error
          }
        })
      )

      // Map results, returning null for rejected promises
      const vals = results.map((result) => (result.status === 'fulfilled' ? result.value : null))
      return vals
    },
    {
      ...parent.dataLoaderOptions,
      // Cache key based on user and team
      cacheKeyFn: ({teamId, userId}: {teamId: string; userId: string}) => `${userId}:${teamId}`
    }
  )
}
