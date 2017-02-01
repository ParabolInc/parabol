import getRethink from 'server/database/rethinkDriver';
import {GraphQLNonNull, GraphQLID, GraphQLList} from 'graphql';
import getRequestedFields from 'server/graphql/getRequestedFields'
import {Notification} from './notificationSchema';
import {requireSUOrSelf} from 'server/utils/authorization';
import makeChangefeedHandler from 'server/utils/makeChangefeedHandler';

export default {
  notifications: {
    type: new GraphQLList(Notification),
    args: {
      userId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique user ID'
      }
    },
    async resolve(source, {userId}, {authToken, socket, subbedChannelName}, refs) {
      const r = getRethink();
      requireSUOrSelf(authToken, userId);
      const requestedFields = getRequestedFields(refs);
      const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName);
      const now = new Date();
      r.table('Notification')
        .getAll(userId, {index: 'userIds'})
        .filter((row) => row('startAt').lt(r.epochTime(now / 1000)))
        .pluck(requestedFields)
        .changes({includeInitial: true})
        .run({cursor: true}, changefeedHandler);
    }
  }
};
