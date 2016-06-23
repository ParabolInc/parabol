import {GraphQLNonNull, GraphQLID, GraphQLString} from 'graphql';
import {CachedUser, CachedUserAndToken} from './cachedUserSchema';
import {errorObj} from '../utils';
import r from '../../../database/rethinkDriver';
import {requireAuth, requireSU} from '../authorization';

export default {
  getUserByUserId: {
    type: CachedUser,
    description: 'A query for admin to find a user by their id',
    args: {
      userId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The user ID for the desired profile'
      }
    },
    async resolve(source, {userId}, {authToken}) {
      requireSU(authToken);
      const user = await r.table('CachedUser').get(userId);
      if (user) {
        return user;
      }
      throw errorObj({_error: 'User ID not found'});
    }
  },
  getUserWithAuthToken: {
    type: CachedUserAndToken,
    description: 'Given an auth token, return the user and auth token',
    args: {
      authToken: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'The ID Token from auth0, a base64 JWT'
      }
    },
    async resolve(source, args, {authToken}) {
      const userId = requireAuth(authToken);
      const user = await r.table('CachedUser').get(userId);
      if (user) {
        return {
          user,
          authToken: args.authToken
        };
      }
      throw errorObj({_error: 'User ID not found'});
    }
  }
};
