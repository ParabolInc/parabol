import {GraphQLObjectType} from 'graphql'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import {updateLocationDragInputFields} from 'server/graphql/types/UpdateLocationDragInput'

const UpdateDragLocationPayload = new GraphQLObjectType({
  name: 'UpdateDragLocationPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    ...updateLocationDragInputFields()
  })
})

export default UpdateDragLocationPayload
