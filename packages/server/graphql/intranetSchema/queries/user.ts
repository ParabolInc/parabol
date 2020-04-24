import {GraphQLID, GraphQLString} from 'graphql'
import {requireSU} from '../../../utils/authorization'
import User from '../../types/User'
import getRethink from '../../../database/rethinkDriver'

const user = {
  type: User,
  args: {
    email: {
      type: GraphQLString,
      description: 'the email of the user'
    },
    userId: {
      type: GraphQLID,
      description: 'the ID of the user'
    }
  },
  description: 'Dig into a user by providing the email or userId',
  async resolve(_source, {email, userId}, {authToken}) {
    requireSU(authToken)
    const r = await getRethink()
    if (email) {
      return r
        .table('User')
        .getAll(email, {index: 'email'})
        .nth(0)
        .default(null)
        .run()
    }
    return r
      .table('User')
      .get(userId)
      .default(null)
      .run()
  }
}

export default user
