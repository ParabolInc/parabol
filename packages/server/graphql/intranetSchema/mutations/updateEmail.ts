import {GraphQLBoolean, GraphQLNonNull} from 'graphql'
import getRethink from '../../../database/rethinkDriver'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import updateUser from '../../../postgres/queries/updateUser'
import {requireSU} from '../../../utils/authorization'
import {InternalContext} from '../../graphql'
import GraphQLEmailType from '../../types/GraphQLEmailType'

const updateEmail = {
  type: new GraphQLNonNull(GraphQLBoolean),
  description: `Updates the user email`,
  args: {
    oldEmail: {
      type: new GraphQLNonNull(GraphQLEmailType),
      description: 'User current email'
    },
    newEmail: {
      type: new GraphQLNonNull(GraphQLEmailType),
      description: 'User new email'
    }
  },
  resolve: async (
    _source: unknown,
    {oldEmail, newEmail}: {oldEmail: string; newEmail: string},
    {authToken}: InternalContext
  ) => {
    const r = await getRethink()

    // AUTH
    requireSU(authToken)

    // VALIDATION
    if (oldEmail === newEmail) {
      throw new Error('New email is the same as the old one')
    }

    const user = await getUserByEmail(oldEmail)
    if (!user) {
      throw new Error(`User with ${oldEmail} not found`)
    }

    // RESOLUTION
    const {id: userId} = user
    const updates = {
      email: newEmail,
      updatedAt: new Date()
    }
    await Promise.all([
      r
        .table('User')
        .get(userId)
        .update(updates)
        .run(),
      r
        .table('TeamMember')
        .getAll(userId, {index: 'userId'})
        .update({
          email: newEmail
        })
        .run(),
      updateUser(updates, userId)
    ])

    return true
  }
}

export default updateEmail
