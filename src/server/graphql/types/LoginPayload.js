import {GraphQLObjectType} from 'graphql';
import {resolveUser} from 'server/graphql/resolvers';
import User from 'server/graphql/types/User';

const LoginPayload = new GraphQLObjectType({
  name: 'LoginPayload',
  fields: () => ({
    user: {
      type: User,
      description: 'The user that just logged in',
      resolve: resolveUser
    }
  })
});

export default LoginPayload;
