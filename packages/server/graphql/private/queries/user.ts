import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import {QueryResolvers} from '../resolverTypes'

const user: QueryResolvers['user'] = async (_source, {email, userId}, {dataLoader}) => {
  if (email) {
    return getUserByEmail(email)
  }
  return (userId && (await dataLoader.get('users').load(userId))) || null
}

export default user
