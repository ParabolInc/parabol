import DataLoader from 'dataloader'
import {GraphQLResolveInfo} from 'graphql'
import GitLabServerManager from '../integrations/gitlab/GitLabServerManager'
import {Issue} from '../types/gitlabTypes'
import sendToSentry from '../utils/sendToSentry'
import {GQLContext} from './../graphql/graphql'
import RootDataLoader from './RootDataLoader'

type GitLabIssueKey = {
  teamId: string
  accessUserId: string
  gid: string
  info: GraphQLResolveInfo
  context: GQLContext
}

export const gitlabIssue = (
  parent: RootDataLoader
): DataLoader<GitLabIssueKey, Issue | null, string> => {
  return new DataLoader<GitLabIssueKey, Issue | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({teamId, accessUserId, gid, info, context}) => {
          const gitlabAuth = await parent
            .get('teamMemberIntegrationAuths')
            .load({service: 'gitlab', teamId, userId: accessUserId})
          if (!gitlabAuth?.providerId) return null
          const {providerId} = gitlabAuth
          const provider = await parent.get('integrationProviders').load(providerId)
          const query = `
              query {
                issue(id: "${gid}"){
                  ...info
                }
              }
          `
          if (!provider?.serverBaseUrl) return null
          const manager = new GitLabServerManager(gitlabAuth, context, info, provider.serverBaseUrl)
          const gitlabRequest = manager.getGitLabRequest(info, context)
          const [data, error] = await gitlabRequest(query, {})
          if (error) {
            console.log(error)
            sendToSentry(error, {userId: accessUserId, tags: {gid, teamId}})
            return null
          }
          return data
        })
      )
      const vals = results.map((result) => (result.status === 'fulfilled' ? result.value : null))
      return vals
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({teamId, accessUserId, gid}) => `${teamId}:${accessUserId}:${gid}`
    }
  )
}
