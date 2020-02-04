import {GraphQLID, GraphQLObjectType} from 'graphql'
import {getUserId} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import {resolveTask} from '../resolvers'
import NotifyTaskInvolves from './NotifyTaskInvolves'
import StandardMutationError from './StandardMutationError'
import Task from './Task'

const UpdateTaskPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdateTaskPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    task: {
      type: Task,
      resolve: resolveTask
    },
    privatizedTaskId: {
      type: GraphQLID,
      description: 'If a task was just turned private, this its ID, else null',
      resolve: ({taskId, isPrivatized}) => {
        return isPrivatized ? taskId : null
      }
    },
    addedNotification: {
      type: NotifyTaskInvolves,
      resolve: async ({notificationIdsToAdd}, _args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        const notifications = await dataLoader.get('notifications').loadMany(notificationIdsToAdd)
        return notifications.filter((notification) => notification.userId === viewerId)
      }
    }
  })
})

export default UpdateTaskPayload
