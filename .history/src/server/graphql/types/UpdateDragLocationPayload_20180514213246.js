import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import Coords2D from 'server/graphql/types/Coords2D'
import {updateDragLocationFields} from 'server/graphql/types/UpdateDragLocationInput'

console.log('CC', Coords2D)
const UpdateDragLocationPayload = new GraphQLObjectType({
  name: 'UpdateDragLocationPayload',
  fields: () => ({
    ...updateDragLocationFields(),
    coords: Coords2D
  })
})

export default UpdateDragLocationPayload
