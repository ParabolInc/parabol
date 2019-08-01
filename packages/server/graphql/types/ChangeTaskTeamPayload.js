import {GraphQLID, GraphQLObjectType} from 'graphql'
import {makeResolveNotificationForViewer, resolveTask} from '../resolvers'
import NotifyTaskInvolves from './NotifyTaskInvolves'
import Task from './Task'
import StandardMutationError from './StandardMutationError'

const ChangeTaskTeamPayload = new GraphQLObjectType({
  name: 'ChangeTaskTeamPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    task: {
      type: Task,
      resolve: resolveTask
    },
    removedNotification: {
      type: NotifyTaskInvolves,
      resolve: makeResolveNotificationForViewer('notificationIdsToRemove', 'notificationsToRemove')
    },
    removedTaskId: {
      type: GraphQLID,
      description:
        'the taskId sent to a user who is not on the new team so they can remove it from their client',
      resolve: async ({taskId}) => {
        return taskId
      }
    }
  })
})

export default ChangeTaskTeamPayload
