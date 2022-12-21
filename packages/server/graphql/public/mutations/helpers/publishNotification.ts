import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import Notification from '../../../../database/types/Notification'
import publish, {SubOptions} from '../../../../utils/publish'

const publishNotification = (notification: Notification, subOptions: SubOptions) => {
  publish(
    SubscriptionChannel.NOTIFICATION,
    notification.userId,
    'AddedNotification',
    {
      addedNotificationId: notification.id
    },
    subOptions
  )
}

export default publishNotification
