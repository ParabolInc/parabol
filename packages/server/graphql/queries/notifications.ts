import {GraphQLInt, GraphQLString, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId} from '../../utils/authorization'
import {NotificationConnection} from '../types/Notification'

export default {
  type: GraphQLNonNull(NotificationConnection),
  args: {
    // currently not used
    first: {
      type: GraphQLInt
    },
    after: {
      type: GraphQLString
    }
  },
  description: 'all the notifications for a single user',
  resolve: async (_source, {first}, {authToken}) => {
    const r = await getRethink()
    // AUTH
    const userId = getUserId(authToken)

    // RESOLUTION
    // TODO consider moving the requestedFields to all queries
    const nodesPlus1 = await r
      .table('Notification')
      .getAll(userId, {index: 'userId'})
      .orderBy(r.desc('createdAt'))
      .limit(first + 1)
      .run()

    const nodes = nodesPlus1.slice(0, -1)
    const edges = nodes.map((node) => ({
      cursor: node.createdAt,
      node
    }))
    const firstEdge = edges[0]
    return {
      edges,
      pageInfo: {
        startCursor: firstEdge && firstEdge.cursor,
        hasNextPage: nodesPlus1.length > first
      }
    }
  }
}
