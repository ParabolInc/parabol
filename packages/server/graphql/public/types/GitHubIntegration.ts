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

  githubSearchQueries: ({teamId, userId, providerId}, _args, {dataLoader}) =>
    dataLoader
      .get('recentIntegrationSearchQueries')
      .load({teamId, userId, service: 'github', providerId})
}

export default GitHubIntegration
