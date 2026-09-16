import IntegrationSearchQueryId from 'parabol-client/shared/gqlIds/IntegrationSearchQueryId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {isRegisteredServerIntegration} from '../../../integrations/platform/registry'
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

  const dbId = IntegrationSearchQueryId.split(id)
  const removedQuery = await getKysely()
    .deleteFrom('IntegrationSearchQuery')
    .where('id', '=', dbId)
    .where('userId', '=', viewerId)
    .where('teamId', '=', teamId)
    .returning('service')
    .executeTakeFirst()
  if (!removedQuery || !isRegisteredServerIntegration(removedQuery.service)) {
    return {error: {message: 'Search query not found'}}
  }

  const data = {teamId, userId: viewerId, service: removedQuery.service}
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
