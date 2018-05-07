import {GraphQLObjectType} from 'graphql';
import StandardMutationError from 'server/graphql/types/StandardMutationError';
import User from 'server/graphql/types/User';
import {resolveUser} from 'server/graphql/resolvers';

const InactivateUserPayload = new GraphQLObjectType({
  name: 'InactivateUserPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    user: {
      type: User,
      description: 'The user that has been inactivated',
      resolve: resolveUser
    }
  })
});

export default InactivateUserPayload;
