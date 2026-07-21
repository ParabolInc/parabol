import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const updateUserTheme: MutationResolvers['updateUserTheme'] = async (
  _source,
  {theme},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const pg = getKysely()
  await pg.updateTable('User').set({theme}).where('id', '=', viewerId).execute()

  // let the viewer's other devices/tabs pick up the new preference live
  const operationId = dataLoader.share()
  const subOptions = {operationId}
  const data = {viewerId}
  publish(SubscriptionChannel.NOTIFICATION, viewerId, 'UpdateUserThemePayload', data, subOptions)

  return data
}

export default updateUserTheme
