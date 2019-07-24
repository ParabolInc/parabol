import {GraphQLObjectType} from 'graphql'
import {resolveNotificationForViewer} from '../resolvers'
import NotifyTaskInvolves from './NotifyTaskInvolves'
import Task from './Task'
import StandardMutationError from './StandardMutationError'

const DeleteTaskPayload = new GraphQLObjectType({
  name: 'DeleteTaskPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    task: {
      type: Task,
      description: 'The task that was deleted'
    },
    involvementNotification: {
      type: NotifyTaskInvolves,
      description: 'The notification stating that the viewer was mentioned or assigned',
      resolve: resolveNotificationForViewer
    }
  })
})

export default DeleteTaskPayload
