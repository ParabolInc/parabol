import NotificationTaskInvolves from '../../../database/types/NotificationTaskInvolves'
import {getUserId} from '../../../utils/authorization'
import errorFilter from '../../errorFilter'
import {CreateTaskPayloadResolvers} from '../resolverTypes'

export type CreateTaskPayloadSource = {
  error?: Error
  taskId?: string
  notificationIds?: string[]
}

const CreateTaskPayload: CreateTaskPayloadResolvers = {
  error: async ({error}) => {
    if (!error) return null
    return {
      message: error.message
    }
  },
  task: async ({taskId}, _args, {authToken, dataLoader}) => {
    const taskDoc = taskId && (await dataLoader.get('tasks').load(taskId))
    if (!taskDoc) return null
    const {userId, tags, teamId} = taskDoc
    const isViewer = userId === getUserId(authToken)
    const isViewerOnTeam = authToken.tms.includes(teamId)
    return isViewer || (!tags.includes('private') && isViewerOnTeam) ? taskDoc : null
  },

  involvementNotification: async ({notificationIds}, _args, {authToken, dataLoader}) => {
    if (!notificationIds) return null
    const notifications = (await dataLoader.get('notifications').loadMany(notificationIds)).filter(
      errorFilter
    ) as NotificationTaskInvolves[]
    const viewerId = getUserId(authToken)
    return notifications.find((notification) => notification.userId === viewerId) || null
  }
}

export default CreateTaskPayload
