import isValid from '../../isValid'
import {QueryResolvers} from '../resolverTypes'

const users: QueryResolvers['users'] = async (_source, {userIds}, {dataLoader}) => {
  const users = (await dataLoader.get('users').loadMany(userIds)).filter(isValid)
  return users
}

export default users
