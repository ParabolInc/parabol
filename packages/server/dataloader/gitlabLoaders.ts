import DataLoader from 'dataloader'
import GitLabOAuth2Manager from '../integrations/gitlab/GitLabOAuth2Manager'
import {IGetTeamMemberIntegrationAuthQueryResult} from '../postgres/queries/generated/getTeamMemberIntegrationAuthQuery'
import upsertTeamMemberIntegrationAuth from '../postgres/queries/upsertTeamMemberIntegrationAuth'
import getRedis from '../utils/getRedis'
import sendToSentry from '../utils/sendToSentry'
import {getGitLabAuthRedisKey} from './../utils/getGitLabAuthRedisKey'
import RootDataLoader from './RootDataLoader'

export const freshGitlabAuth = (parent: RootDataLoader) => {
  return new DataLoader<
    {teamId: string; userId: string},
    IGetTeamMemberIntegrationAuthQueryResult | null,
    string
  >(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({teamId, userId}) => {
          const gitlabAuthToRefresh = await parent.get('teamMemberIntegrationAuths').load({
            service: 'gitlab',
            teamId,
            userId
          })
          if (!gitlabAuthToRefresh) return null
          const redis = getRedis()
          const key = getGitLabAuthRedisKey(userId)
          const isValidAuth = await redis.get(key)
          if (!isValidAuth) {
            const {providerId, refreshToken} = gitlabAuthToRefresh
            if (!refreshToken) {
              sendToSentry(new Error('No refresh token in gitlabAuth'), {userId})
              return null
            }
            const provider = await parent.get('integrationProviders').loadNonNull(providerId)
            const {clientId, clientSecret, serverBaseUrl} = provider
            const manager = new GitLabOAuth2Manager(clientId!, clientSecret!, serverBaseUrl!)
            const oauthRes = await manager.refresh(refreshToken)
            if (oauthRes instanceof Error) {
              sendToSentry(oauthRes, {userId})
              return null
            }
            const {accessToken, refreshToken: newRefreshToken, expires_in} = oauthRes
            const updatedRefreshToken = newRefreshToken || refreshToken
            const newGitlabAuth = {
              ...gitlabAuthToRefresh,
              accessToken,
              refreshToken: updatedRefreshToken
            }
            await upsertTeamMemberIntegrationAuth(newGitlabAuth)
            const tokenTTL = expires_in - 30
            await redis.set(key, tokenTTL, 'EX', tokenTTL)
            return newGitlabAuth
          }
          console.log('🚀  ~ gitlabAuthToRefresh', {
            gitlabAuthToRefresh,
            isValidAuth
          })
          return gitlabAuthToRefresh as IGetTeamMemberIntegrationAuthQueryResult | null
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
