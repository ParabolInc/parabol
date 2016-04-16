import {GraphQLNonNull, GraphQLID} from 'graphql';
import {CachedUser} from './cachedUserSchema';
import {getUserByUserId} from './helpers';
import {errorObj} from '../utils';

export default {
  getUserByUserId: {
    type: CachedUser,
    args: {
      userId: {type: new GraphQLNonNull(GraphQLID), description: 'The user ID for the desired profile'}
    },
    async resolve(source, {userId}) {
      const user = await getUserByUserId(userId);
      if (!user) {
        throw errorObj({_error: 'User ID not found'});
      }
      return user;
    }
  }
};
