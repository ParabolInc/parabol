import {getUserId} from '../../../utils/authorization'
import {AddedNotificationResolvers} from '../resolverTypes'

export type AddedNotificationSource = {addedNotificationId: string}

const AddedNotification: AddedNotificationResolvers = {
  addedNotification: async ({addedNotificationId}, _args: unknown, {dataLoader, authToken}) => {
    const viewerId = getUserId(authToken)
    const notification = (await dataLoader.get('notifications').load(addedNotificationId)) as any
    if (notification.userId === viewerId) {
      return notification
    } else {
      return null
    }
  }
}

export default AddedNotification
