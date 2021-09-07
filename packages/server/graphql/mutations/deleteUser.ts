import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import User from '../../database/types/User'
import {getUserId, isSuperUser} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import DeleteUserPayload from '../types/DeleteUserPayload'
import softDeleteUser from './helpers/softDeleteUser'

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
    const r = await getRethink()
    // AUTH
    if (userId && email) {
      return {error: {message: 'Provide userId XOR email'}}
    }
    if (!userId && !email) {
      return {error: {message: 'Provide a userId or email'}}
    }
    const su = isSuperUser(authToken)
    const viewerId = getUserId(authToken)

    const index = userId ? 'id' : 'email'
    const user = (await r
      .table('User')
      .getAll((userId || email)!, {index})
      .nth(0)
      .default(null)
      .run()) as User
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
