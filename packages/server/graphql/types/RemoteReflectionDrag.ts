import {GraphQLFloat, GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import Coords2D from './Coords2D'
import {GQLContext} from '../graphql'

const RemoteReflectionDrag = new GraphQLObjectType({
  name: 'RemoteReflectionDrag',
  description: 'Info associated with a current drag',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    dragUserId: {
      description: 'The userId of the person currently dragging the reflection',
      type: GraphQLID
    },
    dragUserName: {
      description: 'The name of the dragUser',
      type: GraphQLString,
      resolve: async ({dragUserId}, _args, {dataLoader}: GQLContext) => {
        const user = await dataLoader.get('users').load(dragUserId)
        return user.preferredName
      }
    },
    clientHeight: {
      type: GraphQLFloat
    },
    clientWidth: {
      type: GraphQLFloat
    },
    sourceId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The primary key of the item being drug'
    },
    targetId: {
      type: GraphQLID,
      description: 'The estimated destination of the item being drug'
    },
    targetOffset: {
      description: 'The coordinate offset from the top left of the targetId, if provided',
      type: Coords2D
    },
    coords: {
      description: 'The coordinates relative to the client height/width necessary to simulate a drag for a subscribing user',
      type: Coords2D
    }
  })
})

export default RemoteReflectionDrag
