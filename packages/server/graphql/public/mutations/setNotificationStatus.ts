import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
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

  // RESOLUTION
  await pg.updateTable('Notification').set({status}).where('id', '=', notificationId).execute()
  dataLoader.clearAll('notifications')

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
