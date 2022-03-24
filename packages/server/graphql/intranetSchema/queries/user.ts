import {GraphQLID, GraphQLString} from 'graphql'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import {requireSU} from '../../../utils/authorization'
import {InternalContext} from '../../graphql'
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
  async resolve(
    _source: unknown,
    {email, userId}: {email: string; userId: string},
    {authToken, dataLoader}: InternalContext
  ) {
    requireSU(authToken)
    if (email) {
      return getUserByEmail(email)
    }
    return dataLoader.get('users').load(userId)
  }
}

export default user
