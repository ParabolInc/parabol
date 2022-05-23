import DataLoader from 'dataloader'
import GitLabOAuth2Manager from '../integrations/gitlab/GitLabOAuth2Manager'
import {IGetTeamMemberIntegrationAuthQueryResult} from '../postgres/queries/generated/getTeamMemberIntegrationAuthQuery'
import upsertTeamMemberIntegrationAuth from '../postgres/queries/upsertTeamMemberIntegrationAuth'
import sendToSentry from '../utils/sendToSentry'
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
          const gitlabAuth = await parent.get('teamMemberIntegrationAuths').load({
            service: 'gitlab',
            teamId,
            userId
          })
          if (!gitlabAuth) return null
          const {expiresAt} = gitlabAuth
          const now = new Date()
          if (expiresAt && expiresAt < now) {
            const {providerId, refreshToken} = gitlabAuth
            if (!refreshToken) {
              sendToSentry(new Error('No refresh token in gitlabAuth'), {userId})
              return null
            }
            const provider = await parent.get('integrationProviders').loadNonNull(providerId)
            const {clientId, clientSecret, serverBaseUrl} = provider
            const manager = new GitLabOAuth2Manager(clientId!, clientSecret!, serverBaseUrl!)
            const oauthRes = await manager.refresh(refreshToken)
            if (oauthRes instanceof Error) return null
            const {accessToken, refreshToken: newRefreshToken, expires_in} = oauthRes
            const expiresAtTimestamp = new Date().getTime() + (expires_in - 30) * 1000
            const expiresAt = new Date(expiresAtTimestamp)
            const newGitlabAuth = {
              ...gitlabAuth,
              accessToken,
              refreshToken: newRefreshToken,
              expiresAt
            }
            upsertTeamMemberIntegrationAuth(newGitlabAuth)
            return newGitlabAuth
          }
          return gitlabAuth as IGetTeamMemberIntegrationAuthQueryResult | null
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
