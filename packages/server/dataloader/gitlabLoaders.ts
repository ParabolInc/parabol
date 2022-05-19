import DataLoader from 'dataloader'
import {IGetTeamMemberIntegrationAuthQueryResult} from '../postgres/queries/generated/getTeamMemberIntegrationAuthQuery'
import getRedis from '../utils/getRedis'
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
          const redis = getRedis()
          const isValidAuth = await redis.get(`gitlabAuth::${userId}`)
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
