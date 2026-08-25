import GitHubIntegrationId from '../../../../client/shared/gqlIds/GitHubIntegrationId'
import IntegrationSearchQueryId from '../../../../client/shared/gqlIds/IntegrationSearchQueryId'
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
      .load({teamId, userId, providerId})
    return queries
      .filter((row) => row.service === 'github')
      .map(({id, query, lastUsedAt}) => ({
        id: IntegrationSearchQueryId.join('GitHubSearchQuery', id),
        ...query,
        lastUsedAt: lastUsedAt.toJSON()
      }))
  }
}

export default GitHubIntegration
