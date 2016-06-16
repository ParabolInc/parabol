import {GraphQLNonNull, GraphQLID, GraphQLString} from 'graphql';
import {CachedUser, CachedUserAndToken} from './cachedUserSchema';
import {getUserByUserId} from './helpers';
import {errorObj} from '../utils';

export default {
  getUserByUserId: {
    type: CachedUser,
    args: {
      userId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The user ID for the desired profile'
      }
    },
    async resolve(source, {userId}) {
      const user = await getUserByUserId(userId);
      if (!user) {
        throw errorObj({_error: 'User ID not found'});
      }
      return user;
    }
  },
  getUserWithAuthToken: {
    type: CachedUserAndToken,
    args: {
      authToken: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'The ID Token from auth0, a base64 JWT'
      }
    },
    async resolve(source, args, {authToken}) {
      const user = await getUserByUserId(authToken.sub);
      if (!user) {
        throw errorObj({_error: 'User ID not found'});
      }
      return {
        user,
        authToken: args.authToken
      };
    }
  }
};
