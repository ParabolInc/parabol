import {GraphQLInt, GraphQLList, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {RDatum} from '../../database/stricterR'
import {getUserId} from '../../utils/authorization'
import GraphQLISO8601Type from '../types/GraphQLISO8601Type'
import {NotificationConnection} from '../types/Notification'
import NotificationEnum from '../types/NotificationEnum'

export default {
  type: new GraphQLNonNull(NotificationConnection),
  args: {
    // currently not used
    first: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    after: {
      type: GraphQLISO8601Type
    },
    types: {
      type: new GraphQLList(new GraphQLNonNull(NotificationEnum))
    }
  },
  description: 'all the notifications for a single user',
  resolve: async (_source: unknown, {first, after, types}, {authToken}) => {
    const r = await getRethink()
    // AUTH
    const userId = getUserId(authToken)
    const dbAfter = after || r.maxval
    // RESOLUTION
    // TODO consider moving the requestedFields to all queries
    const nodesPlus1 = await r
      .table('Notification')
      .getAll(userId, {index: 'userId'})
      .orderBy(r.desc('createdAt'))
      .filter((row: RDatum) => {
        if (types) {
          return row('createdAt')
            .lt(dbAfter)
            .and(r.expr(types).contains(row('type')))
        }
        return row('createdAt').lt(dbAfter)
      })
      .limit(first + 1)
      .run()

    const nodes = nodesPlus1.slice(0, first)
    const edges = nodes.map((node) => ({
      cursor: node.createdAt,
      node
    }))
    const lastEdge = edges[edges.length - 1]
    return {
      edges,
      pageInfo: {
        endCursor: lastEdge?.cursor,
        hasNextPage: nodesPlus1.length > first
      }
    }
  }
}
