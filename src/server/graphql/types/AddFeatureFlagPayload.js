import {GraphQLObjectType, GraphQLList, GraphQLString} from 'graphql'
import {resolveUser} from 'server/graphql/resolvers'
import User from 'server/graphql/types/User'
import StandardMutationError from 'server/graphql/types/StandardMutationError'

const AddFeatureFlagPayload = new GraphQLObjectType({
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
      resolve: ({userIds}, args, {dataLoader}) => {
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
