import {getUserId} from '../../../utils/authorization'
import isValid from '../../isValid'
import type {CreateTaskPayloadResolvers} from '../resolverTypes'

export type CreateTaskPayloadSource =
  | {
      taskId: string
      notificationIds?: string[]
    }
  | {error: {message: string}}

const CreateTaskPayload: CreateTaskPayloadResolvers = {
  task: async (source, _args, {authToken, dataLoader}) => {
    if ('error' in source) return null
    const taskDoc = await dataLoader.get('tasks').loadNonNull(source.taskId)
    const {userId, tags, teamId} = taskDoc
    const isViewer = userId === getUserId(authToken)
    const isViewerOnTeam = authToken.tms.includes(teamId)
    return isViewer || (!tags.includes('private') && isViewerOnTeam) ? taskDoc : null
  },

  involvementNotification: async (source, _args, {authToken, dataLoader}) => {
    if ('error' in source || !source.notificationIds) return null
    const notifications = (await dataLoader.get('notifications').loadMany(source.notificationIds))
      .filter(isValid)
      .filter((n) => n.type === 'TASK_INVOLVES')
    const viewerId = getUserId(authToken)
    return notifications.find((notification) => notification.userId === viewerId) || null
  }
}

export default CreateTaskPayload
