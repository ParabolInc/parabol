import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import ClearNotificationPayload from '../types/ClearNotificationPayload'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import {NOTIFICATION} from '../../../client/utils/constants'
import standardError from '../../utils/standardError'

export default {
  type: ClearNotificationPayload,
  description: 'Remove a notification by ID',
  args: {
    notificationId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the notification to remove'
    }
  },
  async resolve(_source, {notificationId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)
    const notification = await r.table('Notification').get(notificationId).run()
    if (!notification || !notification.userIds.includes(viewerId)) {
      return standardError(new Error('Notification not found'), {userId: viewerId})
    }

    // RESOLUTION
    await r
      .table('Notification')
      .get(notificationId)
      .delete()
      .run()

    const data = {notification}
    publish(NOTIFICATION, viewerId, ClearNotificationPayload, data, subOptions)
    return data
  }
}
