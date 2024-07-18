import ms from 'ms'
import GitHubIntegrationId from '../../../../client/shared/gqlIds/GitHubIntegrationId'
import updateGitHubSearchQueries from '../../../postgres/queries/updateGitHubSearchQueries'
import {getUserId} from '../../../utils/authorization'
import {GitHubIntegrationResolvers} from '../resolverTypes'

const GitHubIntegration: GitHubIntegrationResolvers = {
  id: ({teamId, userId}) => GitHubIntegrationId.join(teamId, userId),

  accessToken: async ({accessToken, userId}, _args, {authToken}) => {
    const viewerId = getUserId(authToken)
    return viewerId === userId ? accessToken : null
  },

  isActive: ({accessToken}) => !!accessToken,

  githubSearchQueries: async ({githubSearchQueries, teamId, userId}) => {
    const expirationThresh = ms('60d')
    const thresh = new Date(Date.now() - expirationThresh)
    const unexpiredQueries = githubSearchQueries.filter(
      (query) => new Date(query.lastUsedAt) > thresh
    )
    if (unexpiredQueries.length < githubSearchQueries.length) {
      await updateGitHubSearchQueries({teamId, userId, githubSearchQueries: unexpiredQueries})
    }
    return unexpiredQueries
  }
}

export default GitHubIntegration
