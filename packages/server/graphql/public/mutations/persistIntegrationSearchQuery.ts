import { getUserId, isTeamMember } from '../../../utils/authorization'
import {MutationResolvers} from '../resolverTypes'
import publish from "../../../utils/publish";
import { SubscriptionChannel } from 'parabol-client/types/constEnums'
import upsertIntegrationSearchQuery from '../../../postgres/queries/upsertIntegrationSearchQuery'
import upsertIntegrationSearchQueryWithProviderId from '../../../postgres/queries/upsertIntegrationSearchQueryWithProviderId'
import getIntegrationProvidersByIds from "../../../postgres/queries/getIntegrationProvidersByIds";

const persistIntegrationSearchQuery: MutationResolvers['persistIntegrationSearchQuery'] = async (
  _source,
  {
    teamId,
    service,
    providerId,
    isRemove,
    jiraServerSearchQuery
  },
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  console.log('persistIntegrationSearchQuery')

  //AUTH
  if (!isTeamMember(authToken, teamId)) {
    return {error: {message: `Not on team`}}
  }

  let query;
  switch(service) {
    case 'jiraServer':
      query = jiraServerSearchQuery!
    break;
    // case "jira":
    //   query = jiraSearchQuery!
    // break;
    default:
      throw new Error('Service not implemented')
  }

  if (!isRemove) {
    console.log('userId', viewerId)

    if (providerId) {
      const integrationProviders = await getIntegrationProvidersByIds([providerId])
      const integrationProvider = integrationProviders[0]

      if (!integrationProvider || integrationProvider.teamId !== teamId || integrationProvider.service !== service) {
        return {error: {message: `Provider does not exists`}}
      }
      await upsertIntegrationSearchQueryWithProviderId({
        userId: viewerId,
        teamId,
        service,
        query,
        providerId
      })
    } else {
      await upsertIntegrationSearchQuery({
        userId: viewerId,
        teamId,
        service,
        query
      })
    }
  } else {
    // TODO: implement delete
  }

  const data = {teamId, userId: viewerId}

  publish(
    SubscriptionChannel.NOTIFICATION,
    viewerId,
    'PersistIntegrationSearchQuerySuccess',
    data,
    subOptions
  )

  return data
}

export default persistIntegrationSearchQuery
