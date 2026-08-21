import GitHubIntegrationId from '../../../../client/shared/gqlIds/GitHubIntegrationId'
import {getUserId} from '../../../utils/authorization'
import type {GitHubIntegrationResolvers} from '../resolverTypes'

const GitHubIntegration: GitHubIntegrationResolvers = {
  id: ({teamId, userId}) => GitHubIntegrationId.join(teamId, userId),

  accessToken: async ({accessToken, userId}, _args, {authToken}) => {
    const viewerId = getUserId(authToken)
    return viewerId === userId ? accessToken : null
  },

  isActive: ({accessToken}) => !!accessToken,

  githubSearchQueries: async ({teamId, userId, providerId}, _args, {dataLoader}) => {
    const queries = await dataLoader
      .get('recentIntegrationSearchQueries')
      .load({teamId, userId, service: 'github', providerId})
    return queries.map(({id, query, lastUsedAt}) => ({
      id: String(id),
      queryString: (query as {queryString: string}).queryString,
      lastUsedAt: lastUsedAt.toJSON()
    }))
  }
}

export default GitHubIntegration
