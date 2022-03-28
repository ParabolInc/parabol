import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import {requireSU} from '../../../utils/authorization'
import {QueryResolvers} from '../resolverTypes'

const user: QueryResolvers['user'] = async (_source, {email, userId}, {authToken, dataLoader}) => {
  requireSU(authToken)
  if (email) {
    return getUserByEmail(email)
  }
  return dataLoader.get('users').load(userId)
}

export default user
