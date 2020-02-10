import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import StandardMutationError from './StandardMutationError'
import Task from './Task'

const DeleteTaskPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'DeleteTaskPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    task: {
      type: Task,
      description: 'The task that was deleted'
    }
  })
})

export default DeleteTaskPayload
