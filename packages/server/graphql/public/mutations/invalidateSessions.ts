import {GraphQLError} from 'graphql'
import {getUserId} from '../../../utils/authorization'
import {blacklistJWT} from '../../../utils/blacklistJWT'
import type {MutationResolvers} from '../resolverTypes'

const invalidateSessions: MutationResolvers['invalidateSessions'] = async (
  _source,
  _args,
  context
) => {
  const {authToken, socketId} = context
  const viewerId = getUserId(authToken)

  if (!viewerId) {
    throw new GraphQLError('Not authenticated', {extensions: {code: 'UNAUTHENTICATED'}})
  }
  const {iat} = authToken
  await blacklistJWT(viewerId, iat, socketId)
  return {}
}

export default invalidateSessions
