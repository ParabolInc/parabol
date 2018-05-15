import { GraphQLFloat, GraphQLID, GraphQLNonNull, GraphQLObjectType } from 'graphql'
import Coords2D from 'server/graphql/types/Coords2D'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import DraggableTypeEnum from 'server/graphql/types/DraggableTypeEnum'

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
      type: new GraphQLNonNull(Coords2D)
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
      type: new GraphQLNonNull(DraggableTypeEnumeEnum),
      description: 'The type of entity being drug'
    }

  })
})

export default UpdateDragLocationPayload
