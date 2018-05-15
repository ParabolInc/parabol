import {GraphQLBoolean, GraphQLID, GraphQLObjectType, GraphQLNonNull, GraphQLFloat} from 'graphql'
import {makeResolve, resolveNewMeeting} from 'server/graphql/resolvers'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import NewMeeting from 'server/graphql/types/NewMeeting'
import RetroReflection from 'server/graphql/types/RetroReflection'
import User from 'server/graphql/types/User'
import DraggableTypeEnum from 'server/graphql/types/DraggableTypeEnum'
import DraggerCoords from 'server/graphql/types/DraggerCoords'
import Coords2D from 'server/graphql/types/Coords2D'

const UpdateDragLocationPayload = new GraphQLObjectType({
  name: 'UpdateDragLocationPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    clientWidth: {
      type: new GraphQLNonNull(GraphQLFloat)
    },
    coords: {
      type: new GraphQLNonNull(Coords2DD)
    },
    distance: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'A float from 0 to 1 representing the % of the distance traveled from the origin to the target'
    },
    sourceId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The primary key of the item being drug'
    },
    targetId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The assumed destination of the item being drug'
    },
    type: {
      type: new GraphQLNonNull(DraggableTypeEnumm),
      description: 'The type of entity being drug'
    }
  })
})

export default UpdateDragLocationPayload
