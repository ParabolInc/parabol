import Notification from '../../../database/types/Notification'
import NotificationTaskInvolves from '../../../database/types/NotificationTaskInvolves'
import {getUserId} from '../../../utils/authorization'
import {UpdateTaskPayloadResolvers} from '../resolverTypes'

export type UpdateTaskPayloadSource = {
  taskId: string
  isPrivatized: boolean
  notificationsToAdd?: NotificationTaskInvolves[]
}

const UpdateTaskPayload: UpdateTaskPayloadResolvers = {
  task: async ({taskId}, _args, {authToken, dataLoader}) => {
    const taskDoc = await dataLoader.get('tasks').load(taskId)
    if (!taskDoc) return null
    const {userId, tags, teamId} = taskDoc
    const isViewer = userId === getUserId(authToken)
    const isViewerOnTeam = authToken.tms.includes(teamId)
    return isViewer || (!tags.includes('private') && isViewerOnTeam) ? taskDoc : null
  },

  privatizedTaskId: ({taskId, isPrivatized}) => {
    return isPrivatized ? taskId : null
  },

  addedNotification: async ({notificationsToAdd}, _args, {authToken}) => {
    const viewerId = getUserId(authToken)
    return (
      notificationsToAdd?.find((notification: Notification) => notification.userId === viewerId) ??
      null
    )
  }
}

export default UpdateTaskPayload
