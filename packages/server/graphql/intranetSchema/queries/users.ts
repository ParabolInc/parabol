import {GQLContext} from './../../graphql'
import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql'
import {requireSU} from '../../../utils/authorization'
import User from '../../types/User'

const users = {
  type: new GraphQLNonNull(new GraphQLList(User)),
  args: {
    userIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: 'a list of userIds'
    }
  },
  description: 'Dig into many users by providing the userId',
  async resolve(
    _source: unknown,
    {userIds}: {userIds: string[]},
    {authToken, dataLoader}: GQLContext
  ) {
    requireSU(authToken)
    const users = await dataLoader.get('users').loadMany(userIds)
    return users
  }
}

export default users
