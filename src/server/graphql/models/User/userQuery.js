import {GraphQLNonNull, GraphQLID} from 'graphql';
import {errorObj} from 'server/utils/utils';
import getRethink from 'server/database/rethinkDriver';
import {requireAuth, requireSU} from 'server/utils/authorization';
import User from 'server/graphql/types/User';

export default {
  getUserByUserId: {
    type: User,
    description: 'A query for admin to find a user by their id',
    args: {
      userId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The user ID for the desired user'
      }
    },
    async resolve(source, {userId}, {authToken}) {
      const r = getRethink();
      requireSU(authToken);
      const user = await r.table('User').get(userId);
      if (user) {
        return user;
      }
      throw errorObj({_error: 'User ID not found'});
    }
  },
  getCurrentUser: {
    type: User,
    description: 'Given an auth token, return the user and auth token',
    async resolve(source, args, {authToken}) {
      const r = getRethink();
      const userId = requireAuth(authToken);
      const user = await r.table('User').get(userId);
      if (!user) {
        throw errorObj({_error: 'User ID not found'});
      }
      return user;
    }
  }
};
