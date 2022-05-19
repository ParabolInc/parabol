import DataLoader from 'dataloader'
import {decode} from 'jsonwebtoken'
import {IGetTeamMemberIntegrationAuthQueryResult} from '../postgres/queries/generated/getTeamMemberIntegrationAuthQuery'
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
          if (!gitlabAuthToRefresh) {
            console.log('🚀  ~ noop!')
            return null
          }
          console.log('🚀  ~ gitlabAuthToRefresh', gitlabAuthToRefresh)
          const {accessToken: existingAccessToken, refreshToken, providerId} = gitlabAuthToRefresh
          const decodedToken = existingAccessToken && (decode(existingAccessToken) as any)
          console.log('🚀  ~ decodedToken', decodedToken)
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
