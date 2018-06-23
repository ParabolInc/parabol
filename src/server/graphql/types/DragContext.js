import {GraphQLID, GraphQLObjectType} from 'graphql'
import {makeResolve} from 'server/graphql/resolvers'
import Coords2D from 'server/graphql/types/Coords2D'
import User from 'server/graphql/types/User'

const DragContext = new GraphQLObjectType({
  name: 'DragContext',
  description: 'Info associated with a current drag',
  fields: () => ({
    id: {
      type: GraphQLID
    },
    dragUserId: {
      description: 'The userId of the person currently dragging the reflection',
      type: GraphQLID
    },
    dragUser: {
      description: 'The user that is currently dragging the reflection',
      type: User,
      resolve: makeResolve('dragUserId', 'dragUser', 'users')
    },
    dragCoords: {
      description: 'The coordinates necessary to simulate a drag for a subscribing user',
      type: Coords2D
    }
  })
})

export default DragContext
