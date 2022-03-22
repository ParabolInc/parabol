import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import {QueryResolvers} from '../resolverTypes'

const user: QueryResolvers['user'] = async (_source, {email, userId}, {dataLoader}) => {
  if (email) {
    return getUserByEmail(email)
  }
  return dataLoader.get('users').load(userId)
}

export default user
