import {GraphQLObjectType, GraphQLNonNull} from 'graphql'
import {updateLocationDragInputFields} from 'server/graphql/types/UpdateLocationDragInput'
import Coords2DInput from 'server/graphql/types/Coords2DInput'

const UpdateDragLocationPayload = new GraphQLObjectType({
  name: 'UpdateDragLocationPayload',
  fields: () => ({
    ...updateLocationDragInputFields(),
    coords: new GraphQLNonNull(Coords2DInput)
  })
})

export default UpdateDragLocationPayload
