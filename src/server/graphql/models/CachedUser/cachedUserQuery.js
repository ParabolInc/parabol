import {GraphQLNonNull, GraphQLID} from 'graphql';
import {CachedUser} from './cachedUserSchema';
import {errorObj} from '../utils';
import r from 'server/database/rethinkDriver';
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
  getCurrentUser: {
    type: CachedUser,
    description: 'Given an auth token, return the user and auth token',
    async resolve(source, args, {authToken}) {
      const userId = requireAuth(authToken);
      const user = await r.table('CachedUser').get(userId);
      if (!user) {
        throw errorObj({_error: 'User ID not found'});
      }
      return user;
    }
  }
};
