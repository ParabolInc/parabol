import {RemovedNotificationResolvers} from '../resolverTypes'

export type RemovedNotificationSource = {removedNotificationId: string}

const RemovedNotification: RemovedNotificationResolvers = {
  removedNotificationId: async ({removedNotificationId}) => {
    return removedNotificationId
  }
}

export default RemovedNotification
