import r from '../../../database/rethinkDriver';
import {GraphQLNonNull, GraphQLID, GraphQLBoolean} from 'graphql';
import {AUTHENTICATED} from './connectionSchema';
import {requireSUOrSelf} from '../authorization';

export default {
  addConnection: {
    type: GraphQLBoolean,
    description: 'Add a socket connection for a given team member',
    args: {
      userId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The cachedUserId stored in the JWT'
      },
      socketId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The new socket opened for that user'
      }
    },
    async resolve(source, {userId, socketId}, {authToken}) {
      requireSUOrSelf(authToken);
      const now = new Date();
      const newConnection = {
        id: socketId,
        userId,
        createdAt: now,
        status: AUTHENTICATED
      };
      await r.table('Connection').insert(newConnection);
      return true;
    }
  }
};
