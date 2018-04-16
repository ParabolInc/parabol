import {GraphQLObjectType, GraphQLString} from 'graphql';
import {resolveUser} from 'server/graphql/resolvers';
import User from 'server/graphql/types/User';
import StandardMutationError from 'server/graphql/types/StandardMutationError';

const AddFeatureFlagPayload = new GraphQLObjectType({
  name: 'AddFeatureFlagPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    user: {
      type: User,
      description: 'the user that was given the super power',
      resolve: resolveUser
    },
    result: {
      type: GraphQLString,
      description: 'A human-readable result'
    }
  })
});

export default AddFeatureFlagPayload;
