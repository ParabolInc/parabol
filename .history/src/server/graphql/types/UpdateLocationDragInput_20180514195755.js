import { GraphQLFloat, GraphQLID, GraphQLInputObjectType, GraphQLNonNull } from 'graphql'
import Coords2D from 'server/graphql/types/Coords2D'
import DraggableTypeEnum from 'server/graphql/types/DraggableTypeEnum'
import Coords2DInput from 'server/graphql/types/Coords2DInput'

export const updateLocationDragInputFields = () => ({
  clientWidth: {
    type: new GraphQLNonNull(GraphQLFloat)
  },
  coords: {
    type: new GraphQLNonNull(Coords2DInput)
  },
  distance: {
    type: new GraphQLNonNull(GraphQLFloat),
    description:
      'A float from 0 to 1 representing the % of the distance traveled from the source centroid to the target centroid'
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
    type: new GraphQLNonNull(DraggableTypeEnum),
    description: 'The type of entity being drug'
  }
})

const UpdateDragLocationInput = new GraphQLInputObjectType({
  name: 'UpdateLocationDragInput',
  fields: () => ({
    ...updateLocationDragInputFields(),
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamId to broadcast the message to'
    }
  })
})

export default UpdateDragLocationInput
