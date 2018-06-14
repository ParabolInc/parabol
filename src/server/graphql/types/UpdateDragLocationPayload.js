import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import Coords2D from 'server/graphql/types/Coords2D'
import {updateDragLocationFields} from 'server/graphql/types/UpdateDragLocationInput'

const UpdateDragLocationPayload = new GraphQLObjectType({
  name: 'UpdateDragLocationPayload',
  fields: () => ({
    ...updateDragLocationFields(),
    coords: {
      type: new GraphQLNonNull(Coords2D)
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  })
})

export default UpdateDragLocationPayload
