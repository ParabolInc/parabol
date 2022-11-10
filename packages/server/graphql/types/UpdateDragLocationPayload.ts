import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import RemoteReflectionDrag from './RemoteReflectionDrag'

const UpdateDragLocationPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdateDragLocationPayload',
  fields: () => ({
    remoteDrag: {
      type: RemoteReflectionDrag,
      description: 'The drag as sent from the team member'
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  })
})

export default UpdateDragLocationPayload
