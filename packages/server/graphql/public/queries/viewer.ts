import {GraphQLError} from 'graphql'
import {getUserId} from '../../../utils/authorization'
import type {QueryResolvers} from '../resolverTypes'

const viewerResolver: QueryResolvers['viewer'] = (_source, _args, {authToken, dataLoader}) => {
  const viewerId = getUserId(authToken)
  if (!viewerId) throw new GraphQLError('Please log in')
  return dataLoader.get('users').loadNonNull(viewerId)
}

export default viewerResolver
