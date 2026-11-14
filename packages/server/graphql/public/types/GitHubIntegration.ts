import GitHubIntegrationId from '../../../../client/integrations/github/shared/GitHubIntegrationId'
import {getUserId} from '../../../utils/authorization'
import type {GitHubIntegrationResolvers} from '../resolverTypes'

const GitHubIntegration: GitHubIntegrationResolvers = {
  id: ({teamId, userId}) => GitHubIntegrationId.join(teamId, userId),

  accessToken: async ({accessToken, userId}, _args, {authToken}) => {
    const viewerId = getUserId(authToken)
    return viewerId === userId ? accessToken : null
  },

  isActive: ({accessToken}) => !!accessToken
}

export default GitHubIntegration
