import {GraphQLBoolean, GraphQLNonNull, GraphQLString} from 'graphql'
import getRethink from '../../../database/rethinkDriver'
import {requireSU} from '../../../utils/authorization'
import {InternalContext} from '../../graphql'
import updateUser from '../../../postgres/queries/updateUser'

const updateEmail = {
  type: GraphQLNonNull(GraphQLBoolean),
  description: `Updates the user email`,
  args: {
    oldEmail: {
      type: GraphQLNonNull(GraphQLString),
      description: 'User current email'
    },
    newEmail: {
      type: GraphQLNonNull(GraphQLString),
      description: 'User new email'
    }
  },
  resolve: async (_source, {oldEmail, newEmail}, {authToken}: InternalContext) => {
    const r = await getRethink()

    // AUTH
    requireSU(authToken)

    // VALIDATION
    if (!newEmail) {
      throw new Error('New email can not be empty')
    }

    if (oldEmail === newEmail) {
      throw new Error('New email is the same as the old one')
    }

    const email = newEmail.toLowerCase().trim()
    if (!email.includes('@')) {
      throw new Error('Invalid email')
    }

    const user = await r
      .table('User')
      .getAll(oldEmail, {index: 'email'})
      .nth(0)
      .default(null)
      .run()
    if (!user) {
      throw new Error(`User with ${oldEmail} not found`)
    }

    // RESOLUTION
    const userId = user.id
    await Promise.all([
      r
        .table('User')
        .get(userId)
        .update({
          email: newEmail
        })
        .run(),
      r
        .table('TeamMember')
        .getAll(userId, {index: 'userId'})
        .update({
          email: newEmail
        })
        .run(),
      updateUser({email: newEmail}, userId)
    ])

    return true
  }
}

export default updateEmail
