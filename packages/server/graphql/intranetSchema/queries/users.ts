import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql'
import {requireSU} from '../../../utils/authorization'
import User from '../../types/User'

const users = {
  type: GraphQLNonNull(GraphQLList(User)),
  args: {
    userIds: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(GraphQLID))),
      description: 'a list of userIds'
    }
  },
  description: 'Dig into many users by providing the userId',
  async resolve(_source, {userIds}, {authToken, dataLoader}) {
    requireSU(authToken)
    const users = await dataLoader.get('users').loadMany(userIds)
    return users
  }
}

export default users
