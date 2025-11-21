import ms from 'ms'
import GitHubIntegrationId from '../../../../client/shared/gqlIds/GitHubIntegrationId'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import type {GitHubIntegrationResolvers} from '../resolverTypes'

const GitHubIntegration: GitHubIntegrationResolvers = {
  id: ({teamId, userId}) => GitHubIntegrationId.join(teamId, userId),

  accessToken: async ({accessToken, userId}, _args, {authToken}) => {
    const viewerId = getUserId(authToken)
    return viewerId === userId ? accessToken : null
  },

  isActive: ({accessToken}) => !!accessToken,

  githubSearchQueries: async ({githubSearchQueries, teamId, userId}) => {
    const expirationThresh = ms('60d')
    const thresh = new Date(Date.now() - expirationThresh).toISOString()
    const unexpiredQueries = githubSearchQueries.filter((query) => query.lastUsedAt > thresh)
    if (unexpiredQueries.length < githubSearchQueries.length) {
      await getKysely()
        .updateTable('GitHubAuth')
        .set({githubSearchQueries: unexpiredQueries.map((obj) => JSON.stringify(obj))})
        .where('teamId', '=', teamId)
        .where('userId', '=', userId)
        .execute()
    }
    return unexpiredQueries
  }
}

export default GitHubIntegration
