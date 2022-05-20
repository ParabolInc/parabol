import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {USER_REASON_REMOVED_LIMIT} from '../../postgres/constants'
import {getUserByEmail} from '../../postgres/queries/getUsersByEmails'
import {getUserById} from '../../postgres/queries/getUsersByIds'
import updateUser from '../../postgres/queries/updateUser'
import {getUserId, isSuperUser} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import DeleteUserPayload from '../types/DeleteUserPayload'
import sendAccountRemovedToSegment from './helpers/sendAccountRemovedToSegment'
import softDeleteUser from './helpers/softDeleteUser'

const markUserSoftDeleted = async (
  userIdToDelete: string,
  deletedUserEmail: string,
  validReason: string
) => {
  const update = {
    isRemoved: true,
    email: deletedUserEmail,
    reasonRemoved: validReason,
    updatedAt: new Date()
  }
  await updateUser(update, userIdToDelete)
}

export default {
  type: new GraphQLNonNull(DeleteUserPayload),
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
    _source: unknown,
    {userId, email, reason}: {userId: string; email: string; reason: string},
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
    const user = userId ? await getUserById(userId) : email ? await getUserByEmail(email) : null
    const validReason = reason?.trim().slice(0, USER_REASON_REMOVED_LIMIT) || 'No reason provided'

    if (!su) {
      if (!user || userId !== viewerId) {
        return {error: {message: 'Cannot delete someone else'}}
      }
    } else if (!user) {
      return {error: {message: 'User not found'}}
    }
    const {id: userIdToDelete} = user

    const deletedUserEmail = await softDeleteUser(userIdToDelete, dataLoader)
    await markUserSoftDeleted(userIdToDelete, deletedUserEmail, validReason)

    sendAccountRemovedToSegment(userIdToDelete, user.email, validReason)

    return {}
  }
}
