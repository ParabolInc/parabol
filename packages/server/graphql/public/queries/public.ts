import {getUserId} from '../../../utils/authorization'
import type {QueryResolvers} from '../resolverTypes'

const publicResolver: QueryResolvers['public'] = (_source, _args, {authToken}) => {
  const viewerId = getUserId(authToken)
  return {
    id: `publicRoot:${viewerId}`
  }
}

export default publicResolver
