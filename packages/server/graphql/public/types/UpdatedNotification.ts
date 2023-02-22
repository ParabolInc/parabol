import {getUserId} from '../../../utils/authorization'
import {UpdatedNotificationResolvers} from '../resolverTypes'

export type UpdatedNotificationSource = {updatedNotificationId: string}

const UpdatedNotification: UpdatedNotificationResolvers = {
  updatedNotification: async ({updatedNotificationId}, _args: unknown, {dataLoader, authToken}) => {
    const viewerId = getUserId(authToken)
    const notification = await dataLoader.get('notifications').load(updatedNotificationId)
    if (notification.userId !== viewerId) {
      throw new Error(
        `Viewer ID does not match notification user ID: notification ${updatedNotificationId} published to user ${viewerId}`
      )
    }

    return notification
  }
}

export default UpdatedNotification
