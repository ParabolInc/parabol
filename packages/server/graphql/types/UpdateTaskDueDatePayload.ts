import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveTask} from '../resolvers'
import StandardMutationError from './StandardMutationError'
import Task from './Task'

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
