import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import publish, {SubOptions} from '../../../../utils/publish'

const unpublishNotification = (id: string, userId: string, subOptions: SubOptions) => {
  publish(
    SubscriptionChannel.NOTIFICATION,
    userId,
    'RemovedNotification',
    {
      removedNotificationId: id
    },
    subOptions
  )
}

export default unpublishNotification
