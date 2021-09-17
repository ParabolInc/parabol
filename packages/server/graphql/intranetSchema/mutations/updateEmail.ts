import {GraphQLBoolean, GraphQLNonNull} from 'graphql'
import getRethink from '../../../database/rethinkDriver'
import {requireSU} from '../../../utils/authorization'
import {InternalContext} from '../../graphql'
import updateUser from '../../../postgres/queries/updateUser'
import GraphQLEmailType from '../../types/GraphQLEmailType'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'

const updateEmail = {
  type: GraphQLNonNull(GraphQLBoolean),
  description: `Updates the user email`,
  args: {
    oldEmail: {
      type: GraphQLNonNull(GraphQLEmailType),
      description: 'User current email'
    },
    newEmail: {
      type: GraphQLNonNull(GraphQLEmailType),
      description: 'User new email'
    }
  },
  resolve: async (
    _source,
    {oldEmail, newEmail}: {oldEmail: string; newEmail: string},
    {authToken, dataLoader}: InternalContext
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
    await dataLoader.get('users').clear(userId)

    return true
  }
}

export default updateEmail
