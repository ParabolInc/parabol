import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import publish, {SubOptions} from '../../../../utils/publish'

const publishNotification = (
  notification: {id: string; userId: string},
  subOptions: SubOptions
) => {
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
