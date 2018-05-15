import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import Coords2D from 'server/graphql/types/Coords2D'
import {updateDragLocationFields} from 'server/graphql/types/UpdateDragLocationInput'

const UpdateDragLocationPayload = new GraphQLObjectType({
  name: 'UpdateDragLocationPayload',
  fields: () => ({
    ...updateDragLocationFields(),
    coords: new GraphQLNonNull(Coords2D)
  })
})

export default UpdateDragLocationPayload
