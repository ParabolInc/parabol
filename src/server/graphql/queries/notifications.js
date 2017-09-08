import {forwardConnectionArgs} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';
import getRequestedFields from 'server/graphql/getRequestedFields';
import {NotificationConnection} from 'server/graphql/types/Notification';
import {getUserId} from 'server/utils/authorization';

export default {
  type: NotificationConnection,
  args: {
    // currently not used
    ...forwardConnectionArgs
  },
  description: 'all the notifications for a single user',
  resolve: async (source, args, {authToken}, refs) => {
    const r = getRethink();
    // AUTH
    const userId = getUserId(authToken);

    // RESOLUTION
    // TODO consider moving the requestedFields to all queries
    const nodes = await r.table('Notification')
      .getAll(userId, {index: 'userIds'})
      .filter((row) => row('startAt').le(r.now()))
      .orderBy(r.desc('startAt'));
    const edges = nodes.map((node) => ({
      cursor: node.startAt,
      node
    }));
    const firstEdge = edges[0];
    return {
      edges,
      pageInfo: {
        startCursor: firstEdge && firstEdge.cursor,
        hasNextPage: false
      }
    };
  }
};
