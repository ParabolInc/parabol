import {GraphQLObjectType} from 'graphql'
import {updateLocationDragInputFields} from 'server/graphql/types/UpdateLocationDragInput'

const UpdateDragLocationPayload = new GraphQLObjectType({
  name: 'UpdateDragLocationPayload',
  fields: () => ({
    ...updateLocationDragInputFields(),
    coords: Coords2DInput
  })
})

export default UpdateDragLocationPayload
