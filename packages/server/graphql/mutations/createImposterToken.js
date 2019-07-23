import {GraphQLID, GraphQLNonNull} from 'graphql'
import CreateImposterTokenPayload from 'server/graphql/types/CreateImposterTokenPayload'
import {getUserId, requireSU} from 'server/utils/authorization'
import standardError from 'server/utils/standardError'

const createImposterToken = {
  type: CreateImposterTokenPayload,
  description: 'for troubleshooting by admins, create a JWT for a given userId',
  args: {
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The target userId to impersonate'
    }
  },
  async resolve (source, {userId}, {authToken, dataLoader}) {
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
