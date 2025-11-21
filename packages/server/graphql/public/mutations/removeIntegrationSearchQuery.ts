import {fromGlobalId} from 'graphql-relay'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const removeIntegrationSearchQuery: MutationResolvers['removeIntegrationSearchQuery'] = async (
  _source,
  {id, teamId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  const dbId = parseInt(fromGlobalId(id).id, 10)
  await getKysely()
    .deleteFrom('IntegrationSearchQuery')
    .where('id', '=', dbId)
    .where('userId', '=', viewerId)
    .where('teamId', '=', teamId)
    .execute()

  // RESOLUTION
  const data = {teamId, userId: viewerId}
  publish(
    SubscriptionChannel.NOTIFICATION,
    viewerId,
    'RemoveIntegrationSearchQuerySuccess',
    data,
    subOptions
  )
  return data
}

export default removeIntegrationSearchQuery
