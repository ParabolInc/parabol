import {GraphQLID, GraphQLNonNull} from 'graphql'
import CreateImposterTokenPayload from '../types/CreateImposterTokenPayload'
import {getUserId, requireSU} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'

const createImposterToken = {
  type: new GraphQLNonNull(CreateImposterTokenPayload),
  description: 'for troubleshooting by admins, create a JWT for a given userId',
  args: {
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The target userId to impersonate'
    }
  },
  async resolve(_source: unknown, {userId}: {userId: string}, {authToken, dataLoader}: GQLContext) {
    // AUTH
    requireSU(authToken)
    const viewerId = getUserId(authToken)
    // VALIDATION
    const user = await dataLoader.get('users').load(userId)
    if (!user) {
      return standardError(new Error('Attempted to impersonate bad userId'), {userId: viewerId})
    }

    // RESOLUTION
    return {userId}
  }
}

export default createImposterToken
