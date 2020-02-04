import {GraphQLObjectType} from 'graphql'
import {resolveNotificationForViewer, resolveTask} from '../resolvers'
import NotifyTaskInvolves from './NotifyTaskInvolves'
import Task from './Task'
import StandardMutationError from './StandardMutationError'

const CreateTaskPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'CreateTaskPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    task: {
      type: Task,
      resolve: resolveTask
    },
    involvementNotification: {
      type: NotifyTaskInvolves,
      resolve: resolveNotificationForViewer
    }
  })
})

export default CreateTaskPayload
