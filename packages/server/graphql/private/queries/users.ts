import {requireSU} from '../../../utils/authorization'
import {QueryResolvers} from '../resolverTypes'

const users: QueryResolvers['users'] = async (_source, {userIds}, {authToken, dataLoader}) => {
  requireSU(authToken)
  const users = await dataLoader.get('users').loadMany(userIds)
  return users
}

export default users
