import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const setNotificationStatus: MutationResolvers['setNotificationStatus'] = async (
  _source,
  {notificationId, status},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const viewerId = getUserId(authToken)
  const notification = await dataLoader.get('notifications').load(notificationId)

  if (!notification || notification.userId !== viewerId) {
    return standardError(new Error('Notification not found'), {userId: viewerId})
  }

  // RESOLUTION
  await pg.updateTable('Notification').set({status}).where('id', '=', notificationId).execute()
  notification.status = status

  const data = {notificationId}
  publish(
    SubscriptionChannel.NOTIFICATION,
    viewerId,
    'SetNotificationStatusPayload',
    data,
    subOptions
  )
  return data
}

export default setNotificationStatus
