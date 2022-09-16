import {GraphQLNonNull} from 'graphql'
import AuthToken from '../../database/types/AuthToken'
import {getUserId} from '../../utils/authorization'
import blacklistJWT from '../../utils/blacklistJWT'
import encodeAuthToken from '../../utils/encodeAuthToken'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import InvalidateSessionsPayload from '../types/InvalidateSessionsPayload'

const invalidateSessions = {
  type: new GraphQLNonNull(InvalidateSessionsPayload),
  description: 'Invalidate all sessions by blacklisting all JWTs issued before now',
  resolve: async (_source: unknown, _args: unknown, {authToken, socketId}: GQLContext) => {
    const viewerId = getUserId(authToken)

    if (!viewerId) {
      return standardError(new Error('Not authenticated'))
    }
    const newAuthToken = new AuthToken(authToken)
    const {iat} = newAuthToken
    await blacklistJWT(viewerId, iat, socketId)
    return {authToken: encodeAuthToken(newAuthToken)}
  }
}

export default invalidateSessions
