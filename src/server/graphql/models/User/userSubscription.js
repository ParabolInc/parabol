import getRethink from 'server/database/rethinkDriver';
import {getRequestedFields} from '../utils';
import {GraphQLNonNull, GraphQLID, GraphQLList} from 'graphql';
import {User} from './userSchema';
import makeChangefeedHandler from '../makeChangefeedHandler';

export default {
  usersByIds: {
    args: {
      userIds: {
        type: new GraphQLList(GraphQLNonNull(GraphQLID)),
        description: 'the org to which the billing leaders operate'
      }
    },
    type: User,
    async resolve(source, {userIds}, {authToken, socket, subbedChannelName}, refs) {
      const r = getRethink();
      const requestedFields = getRequestedFields(refs);
      const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName);
      const userId = authToken.sub;
      r.table('User')
        .getAll(r.args(userIds), {index: 'id'})
        .changes({includeInitial: true})
        .map((row) => {
          return {
            new_val: row('new_val').pluck(requestedFields).default(null),
            old_val: row('old_val').pluck(requestedFields).default(null)
          };
        })
        .run({cursor: true}, changefeedHandler);
    }
  },
  user: {
    type: User,
    async resolve(source, args, {authToken, socket, subbedChannelName}, refs) {
      const r = getRethink();
      const requestedFields = getRequestedFields(refs);
      const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName);
      const userId = authToken.sub;
      r.table('User')
        .get(userId)
        .changes({includeInitial: true})
        .map((row) => {
          return {
            new_val: row('new_val').pluck(requestedFields).default(null),
            old_val: row('old_val').pluck(requestedFields).default(null)
          };
        })
        .run({cursor: true}, changefeedHandler);
    }
  }
};
