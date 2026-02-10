import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import {getUserById} from '../../../postgres/queries/getUsersByIds'
import type {MutationResolvers} from '../resolverTypes'
import {hardDeleteUser as hardDeleteUserHelper} from './helpers/hardDeleteUser'

const hardDeleteUser: MutationResolvers['hardDeleteUser'] = async (
  _source,
  {userId, email, reasonText},
  {dataLoader}
) => {
  // VALIDATION
  if (userId && email) {
    return {error: {message: 'Provide userId XOR email'}}
  }
  if (!userId && !email) {
    return {error: {message: 'Provide a userId or email'}}
  }

  const user = userId ? await getUserById(userId) : email ? await getUserByEmail(email) : null
  if (!user) {
    return {error: {message: 'User not found'}}
  }

  await hardDeleteUserHelper(user, reasonText ?? '', dataLoader)
  return {}
}

export default hardDeleteUser
