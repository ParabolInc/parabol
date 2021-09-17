import {GraphQLID, GraphQLString} from 'graphql'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import db from '../../../db'
import {requireSU} from '../../../utils/authorization'
import User from '../../types/User'

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
  async resolve(_source, {email, userId}: {email: string; userId: string}, {authToken}) {
    requireSU(authToken)
    if (email) {
      return getUserByEmail(email)
    }
    return db.read('User', userId)
  }
}

export default user
