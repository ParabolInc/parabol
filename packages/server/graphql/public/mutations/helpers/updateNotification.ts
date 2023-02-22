import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import Notification from '../../../../database/types/Notification'
import publish, {SubOptions} from '../../../../utils/publish'

const updateNotification = (notification: Notification, subOptions: SubOptions) => {
  publish(
    SubscriptionChannel.NOTIFICATION,
    notification.userId,
    'UpdatedNotification',
    {
      updatedNotificationId: notification.id
    },
    subOptions
  )
}

export default updateNotification
