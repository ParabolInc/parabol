import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type'
import RetroPhaseItem from 'server/graphql/types/RetroPhaseItem'
import RetroReflectionGroup from 'server/graphql/types/RetroReflectionGroup'
import RetrospectiveMeeting from 'server/graphql/types/RetrospectiveMeeting'
import {getUserId} from 'server/utils/authorization'
import {makeResolve, resolveForSU} from 'server/graphql/resolvers'
import GoogleAnalyzedEntity from 'server/graphql/types/GoogleAnalyzedEntity'
import User from 'server/graphql/types/User'
import Coords2D from 'server/graphql/types/Coords2D'

const DragContext = new GraphQLObjectType({
  name: 'DragContext',
  description: 'Info associated with a current drag',
  fields: () => ({
    draggerUserId: {
      description: 'The userId of the person currently dragging the reflection',
      type: GraphQLID
    },
    draggerUser: {
      description: 'The user that is currently dragging the reflection',
      type: User,
      resolve: makeResolve('draggerUserId', 'draggerUser', 'users')
    },
    draggerCoords: {
      description: 'The coordinates necessary to simulate a drag for a subscribing user',
      type: Coords2D
    }
  })
})

export default DragContext
