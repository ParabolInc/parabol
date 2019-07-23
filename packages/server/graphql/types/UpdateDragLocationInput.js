import {GraphQLFloat, GraphQLID, GraphQLInputObjectType, GraphQLNonNull} from 'graphql'
import Coords2DInput from 'server/graphql/types/Coords2DInput'

export const updateDragLocationFields = () => ({
  clientHeight: {
    type: new GraphQLNonNull(GraphQLFloat)
  },
  clientWidth: {
    type: new GraphQLNonNull(GraphQLFloat)
  },
  sourceId: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'The primary key of the item being drug'
  },
  targetId: {
    type: GraphQLID,
    description: 'The estimated destination of the item being drug'
  }
})

const UpdateDragLocationInput = new GraphQLInputObjectType({
  name: 'UpdateDragLocationInput',
  fields: () => ({
    ...updateDragLocationFields(),
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamId to broadcast the message to'
    },
    coords: {
      type: new GraphQLNonNull(Coords2DInput)
    },
    targetOffset: {
      type: Coords2DInput,
      description: 'The offset from the targetId'
    }
  })
})

export default UpdateDragLocationInput
