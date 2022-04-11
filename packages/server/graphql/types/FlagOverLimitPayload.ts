import {GraphQLList, GraphQLObjectType} from 'graphql'
import User from './User'
import StandardMutationError from './StandardMutationError'
import {GQLContext} from '../graphql'

const FlagOverLimitPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'FlagOverLimitPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    users: {
      type: new GraphQLList(User),
      description: 'the users with the limit added or removed',
      resolve: ({userIds}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('users').loadMany(userIds)
      }
    }
  })
})

export default FlagOverLimitPayload
