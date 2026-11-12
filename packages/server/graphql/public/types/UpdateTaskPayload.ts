import type {TaskInvolvesNotification} from '../../../postgres/types/Notification'
import {getUserId} from '../../../utils/authorization'
import type {UpdateTaskPayloadResolvers} from '../resolverTypes'

type PartialNotification = {id: string; userId: string}

export type UpdateTaskPayloadSource =
  | {taskId: string; isPrivatized: boolean; notificationsToAdd?: PartialNotification[]}
  | {error: {message: string}}

const UpdateTaskPayload: UpdateTaskPayloadResolvers = {
  task: async (source, _args, {authToken, dataLoader}) => {
    if ('error' in source) return null
    const {taskId} = source
    const taskDoc = await dataLoader.get('tasks').load(taskId)
    if (!taskDoc) return null
    const {userId, tags, teamId} = taskDoc
    const isViewer = userId === getUserId(authToken)
    const isViewerOnTeam = authToken.tms.includes(teamId)
    return isViewer || (!tags.includes('private') && isViewerOnTeam) ? taskDoc : null
  },

  privatizedTaskId: (source) => {
    if ('error' in source) return null
    const {taskId, isPrivatized} = source
    return isPrivatized ? taskId : null
  },

  addedNotification: async (source, _args, {authToken, dataLoader}) => {
    if ('error' in source) return null
    const {notificationsToAdd} = source
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
