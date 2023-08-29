import {getUserId} from '../../../utils/authorization'
import {UserIntegrationsResolvers} from '../resolverTypes'

export interface UserIntegrationsSource {
  userId: string
}

const UserIntegrations: UserIntegrationsResolvers = {
  id: ({userId}) => `userIntegrations:${userId}`,
  github: async ({userId}, _args: unknown, {authToken, dataLoader}) => {
    if (getUserId(authToken) !== userId) return null
    return dataLoader.get('githubAuthForUser').load(userId)
  }
}

export default UserIntegrations
