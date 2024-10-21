import {TaskInvolvesNotification} from '../../../postgres/types/Notification'
import {getUserId} from '../../../utils/authorization'
import {UpdateTaskPayloadResolvers} from '../resolverTypes'

export type UpdateTaskPayloadSource = {
  taskId: string
  isPrivatized: boolean
  notificationsToAdd?: TaskInvolvesNotification[]
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

  addedNotification: async ({notificationsToAdd}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const partial =
      notificationsToAdd?.find((notification) => notification.userId === viewerId) ?? null
    if (!partial) return null
    const notification = await dataLoader
      .get('notifications')
      .loadNonNull<TaskInvolvesNotification>(partial.id)
    return notification
  }
}

export default UpdateTaskPayload
