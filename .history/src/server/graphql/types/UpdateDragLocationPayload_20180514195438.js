import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import Coords2D from 'server/graphql/types/Coords2D'
import {updateLocationDragInputFields} from 'server/graphql/types/UpdateLocationDragInput'

const UpdateDragLocationPayload = new GraphQLObjectType({
  name: 'UpdateDragLocationPayload',
  fields: () => ({
    ...updateLocationDragInputFields(),
    coords: new GraphQLNonNull(Coords2D)
  })
})

export default UpdateDragLocationPayload
