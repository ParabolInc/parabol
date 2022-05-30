import {fromGlobalId} from 'graphql-relay'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import removeIntegrationSearchQueryToPG from '../../../postgres/queries/removeIntegrationSearchQuery'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import {MutationResolvers} from '../resolverTypes'

const removeIntegrationSearchQuery: MutationResolvers['removeIntegrationSearchQuery'] = async (
  _source,
  {id, teamId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  await removeIntegrationSearchQueryToPG(parseInt(fromGlobalId(id).id, 10), viewerId, teamId)

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
