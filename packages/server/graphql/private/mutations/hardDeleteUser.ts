import {GraphQLError} from 'graphql'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import {getUserById} from '../../../postgres/queries/getUsersByIds'
import type {MutationResolvers} from '../resolverTypes'
import {hardDeleteUser as hardDeleteUserHelper} from './helpers/hardDeleteUser'

const hardDeleteUser: MutationResolvers['hardDeleteUser'] = async (
  _source,
  {userId, email},
  {dataLoader}
) => {
  // VALIDATION
  if (userId && email) {
    throw new GraphQLError('Provide userId XOR email', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  if (!userId && !email) {
    throw new GraphQLError('Provide a userId or email', {extensions: {code: 'BAD_USER_INPUT'}})
  }

  const user = userId ? await getUserById(userId) : email ? await getUserByEmail(email) : null
  if (!user) {
    throw new GraphQLError('User not found', {extensions: {code: 'NOT_FOUND'}})
  }

  await hardDeleteUserHelper(user, dataLoader)
  return {}
}

export default hardDeleteUser
