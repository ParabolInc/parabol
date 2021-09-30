import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {getUserId, isSuperUser} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import DeleteUserPayload from '../types/DeleteUserPayload'
import softDeleteUser from './helpers/softDeleteUser'
import getUsersById from '../../postgres/queries/getUsersById'
import {getUserByEmail} from '../../postgres/queries/getUsersByEmails'

export default {
  type: GraphQLNonNull(DeleteUserPayload),
  description: `Delete a user, removing them from all teams and orgs`,
  args: {
    userId: {
      type: GraphQLID,
      description: 'a userId'
    },
    email: {
      type: GraphQLID,
      description: 'the user email'
    },
    reason: {
      type: GraphQLString,
      description: 'the reason why the user wants to delete their account'
    }
  },
  resolve: async (
    _source,
    {userId, email, reason}: {userId?: string; email?: string; reason?: string},
    {authToken, dataLoader}: GQLContext
  ) => {
    // AUTH
    if (userId && email) {
      return {error: {message: 'Provide userId XOR email'}}
    }
    if (!userId && !email) {
      return {error: {message: 'Provide a userId or email'}}
    }
    const su = isSuperUser(authToken)
    const viewerId = getUserId(authToken)

    const user = userId
      ? (await getUsersById([userId]))?.[0]
      : email
      ? await getUserByEmail(email)
      : null
    if (!su) {
      if (!user || userId !== viewerId) {
        return {error: {message: 'Cannot delete someone else'}}
      }
    } else if (!user) {
      return {error: {message: 'User not found'}}
    }
    await softDeleteUser(user, dataLoader, reason)
    return {}
  }
}
