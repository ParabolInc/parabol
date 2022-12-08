import {getUserId} from '../../../utils/authorization'
import {AddedNotificationResolvers, ResolversTypes} from '../resolverTypes'

export type AddedNotificationSource = {addedNotificationId: string}

const AddedNotification: AddedNotificationResolvers = {
  addedNotification: async ({addedNotificationId}, _args: unknown, {dataLoader, authToken}) => {
    const viewerId = getUserId(authToken)
    const notification = await dataLoader.get('notifications').load(addedNotificationId)
    if (notification.userId !== viewerId) {
      throw new Error(
        `Viewer ID does not match notification user ID: notification ${addedNotificationId} for user ${notification.userId} published to user ${viewerId}`
      )
    }

    return notification as ResolversTypes['Notification']
  }
}

export default AddedNotification
