import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import ServerAuthToken from '../../database/types/ServerAuthToken'
import {USER_REASON_REMOVED_LIMIT} from '../../postgres/constants'
import {getUserByEmail} from '../../postgres/queries/getUsersByEmails'
import {getUserById} from '../../postgres/queries/getUsersByIds'
import updateUser from '../../postgres/queries/updateUser'
import {getUserId, isSuperUser} from '../../utils/authorization'
import segmentIo from '../../utils/segmentIo'
import {GQLContext} from '../graphql'
import DeleteUserPayload from '../types/DeleteUserPayload'
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

    // Update HubSpot after deletion
    const executeGraphQL = require('../executeGraphQL').default
    const parabolPayload = await executeGraphQL({
      authToken: new ServerAuthToken(), // Need admin access to run the query
      query: `
        query AccountRemoved($userId: ID!) {
          user(userId: $userId) {
            isRemoved
            company {
              userCount
              activeUserCount
            }
          }
        }
      `,
      variables: {userId: userIdToDelete},
      isPrivate: true
    })
    parabolPayload.data.user.email = user.email
    segmentIo.track({
      userId: userIdToDelete,
      event: 'Account Removed',
      properties: {
        reason: validReason,
        parabolPayload: parabolPayload.data
      }
    })

    return {}
  }
}
