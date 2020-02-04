import {GraphQLObjectType} from 'graphql'
import {resolveNotificationForViewer} from '../resolvers'
import NotifyTaskInvolves from './NotifyTaskInvolves'
import Task from './Task'
import StandardMutationError from './StandardMutationError'

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
