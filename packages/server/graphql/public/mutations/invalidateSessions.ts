import {getUserId} from '../../../utils/authorization'
import blacklistJWT from '../../../utils/blacklistJWT'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const invalidateSessions: MutationResolvers['invalidateSessions'] = async (
  _source,
  _args,
  context
) => {
  const {authToken, socketId} = context
  const viewerId = getUserId(authToken)

  if (!viewerId) {
    return standardError(new Error('Not authenticated'))
  }
  const {iat} = authToken
  await blacklistJWT(viewerId, iat, socketId)
  return {}
}

export default invalidateSessions
