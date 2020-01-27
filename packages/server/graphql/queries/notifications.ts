import {GraphQLInt, GraphQLString} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId} from '../../utils/authorization'
import {NotificationConnection} from '../types/Notification'

export default {
  type: NotificationConnection,
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
  resolve: async (_source, _args, {authToken}) => {
    const r = await getRethink()
    // AUTH
    const userId = getUserId(authToken)

    // RESOLUTION
    // TODO consider moving the requestedFields to all queries
    const nodes = await r
      .table('Notification')
      .getAll(userId, {index: 'userIds'})
      .filter((row) => row('startAt').le(r.now()))
      .filter((row) =>
        row('isArchived')
          .default(false)
          .ne(true)
      )
      .orderBy(r.desc('startAt'))
      .run()
    const edges = nodes.map((node) => ({
      cursor: node.startAt,
      node
    }))
    const firstEdge = edges[0]
    return {
      edges,
      pageInfo: {
        startCursor: firstEdge && firstEdge.cursor,
        hasNextPage: false
      }
    }
  }
}
