import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import Coords2D from './Coords2D'
import {updateDragLocationFields} from './UpdateDragLocationInput'

const UpdateDragLocationPayload = new GraphQLObjectType({
  name: 'UpdateDragLocationPayload',
  fields: () => ({
    ...updateDragLocationFields(),
    coords: {
      type: new GraphQLNonNull(Coords2D)
    },
    targetOffset: {
      type: Coords2D,
      description: 'The offset from the targetId'
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  })
})

export default UpdateDragLocationPayload
