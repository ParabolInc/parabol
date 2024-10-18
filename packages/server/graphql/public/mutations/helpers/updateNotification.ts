import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import publish, {SubOptions} from '../../../../utils/publish'

const updateNotification = (notification: {id: string; userId: string}, subOptions: SubOptions) => {
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
