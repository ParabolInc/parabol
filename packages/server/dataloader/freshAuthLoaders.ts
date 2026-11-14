import DataLoader from 'dataloader'
import createOAuth2Manager from '../integrations/platform/createOAuth2Manager'
import toExpiresAt from '../integrations/platform/toExpiresAt'
import syncTeamMemberIntegrationAuthTokens from '../postgres/queries/syncTeamMemberIntegrationAuthTokens'
import type {TeamMemberIntegrationAuth} from '../postgres/types'
import type {Integrationproviderserviceenum} from '../postgres/types/pg'
import logError from '../utils/logError'
import handleAuthRefreshFailure from './handleAuthRefreshFailure'
import type RootDataLoader from './RootDataLoader'
import settleOrLogRejection from './settleOrLogRejection'

export interface FreshAuthKey {
  service: Integrationproviderserviceenum
  teamId: string
  userId: string
}

const isExpired = (expiresAt: Date | null) => !!expiresAt && expiresAt < new Date()

/** The viewer's active auth row, with an expired OAuth2 access token refreshed first. Rows whose provider has no OAuth2 manager come back as stored */
export const freshAuth = (parent: RootDataLoader) => {
  return new DataLoader<FreshAuthKey, TeamMemberIntegrationAuth | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async (key) => {
          const auth = await parent
            .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
            .load(key)
          if (!auth || !isExpired(auth.expiresAt)) return auth
          const {service, teamId, userId} = key
          const {providerId, refreshToken} = auth
          if (!refreshToken) {
            logError(new Error(`${service} auth expired without a refresh token`), {
              userId,
              tags: {teamId, service}
            })
            return null
          }
          const provider = await parent.get('integrationProviders').loadNonNull(providerId)
          const manager = createOAuth2Manager(provider)
          if (!manager) {
            logError(
              new Error(`${service} auth expired but provider ${providerId} has no OAuth2 manager`),
              {userId, tags: {teamId, service}}
            )
            return auth
          }
          const oauthRes = await manager.refresh(refreshToken)
          if (oauthRes instanceof Error) return handleAuthRefreshFailure(oauthRes, auth)
          const tokens = {
            accessToken: oauthRes.accessToken,
            refreshToken: oauthRes.refreshToken || refreshToken,
            scopes: auth.scopes,
            expiresAt: toExpiresAt(oauthRes.expiresIn)
          }
          await syncTeamMemberIntegrationAuthTokens({
            userId,
            teamId,
            providerId,
            providerUserId: auth.providerUserId,
            ...tokens
          })
          return {...auth, ...tokens}
        })
      )
      return settleOrLogRejection(results, keys)
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({service, teamId, userId}) => `${service}:${userId}:${teamId}`
    }
  )
}
