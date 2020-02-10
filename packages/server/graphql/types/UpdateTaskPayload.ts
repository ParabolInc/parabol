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
      resolve: async ({notificationsToAdd}, _args, {authToken}) => {
        const viewerId = getUserId(authToken)
        return notificationsToAdd.find((notification) => notification.userId === viewerId)
      }
    }
  })
})

export default UpdateTaskPayload
