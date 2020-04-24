import {GraphQLObjectType, GraphQLList, GraphQLString} from 'graphql'
import {resolveUser} from '../resolvers'
import User from './User'
import StandardMutationError from './StandardMutationError'
import {GQLContext} from '../graphql'

const AddFeatureFlagPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'AddFeatureFlagPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    user: {
      type: User,
      description:
        'the user that was given the super power. Use users instead in GraphiQL since it may affect multiple users',
      resolve: resolveUser
    },
    users: {
      type: new GraphQLList(User),
      description: 'the users given the super power',
      resolve: ({userIds}, _args, {dataLoader}) => {
        return dataLoader.get('users').loadMany(userIds)
      }
    },
    result: {
      type: GraphQLString,
      description: 'A human-readable result'
    }
  })
})

export default AddFeatureFlagPayload
