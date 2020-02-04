import {GraphQLObjectType} from 'graphql'
import {resolveTask} from '../resolvers'
import Task from './Task'
import StandardMutationError from './StandardMutationError'

const UpdateTaskDueDatePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdateTaskDueDatePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    task: {
      type: Task,
      resolve: resolveTask
    }
  })
})

export default UpdateTaskDueDatePayload
