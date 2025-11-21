import {sql} from 'kysely'
import IntegrationProviderId from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {selectIntegrationProvider} from '../../../postgres/select'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import type {
  JiraSearchQueryInput,
  JiraServerSearchQueryInput,
  MutationResolvers
} from '../resolverTypes'

const persistIntegrationSearchQuery: MutationResolvers['persistIntegrationSearchQuery'] = async (
  _source,
  {teamId, service, providerId, jiraServerSearchQuery},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  //AUTH
  if (!isTeamMember(authToken, teamId)) {
    return {error: {message: `Not on team`}}
  }

  let query: JiraServerSearchQueryInput | JiraSearchQueryInput
  switch (service) {
    case 'jiraServer':
      query = jiraServerSearchQuery!
      break
    // case "jira":
    //   query = jiraSearchQuery!
    // break;
    default:
      throw new Error('Service not implemented')
  }

  const dbProviderId = providerId ? IntegrationProviderId.split(providerId) : null

  if (dbProviderId) {
    const integrationProvider = await selectIntegrationProvider()
      .where('id', '=', dbProviderId)
      .where('isActive', '=', true)
      .executeTakeFirst()

    if (
      !integrationProvider ||
      integrationProvider.teamId !== teamId ||
      integrationProvider.service !== service
    ) {
      return {error: {message: `Provider does not exists`}}
    }
  }

  await getKysely()
    .insertInto('IntegrationSearchQuery')
    .values({
      userId: viewerId,
      teamId,
      service,
      query,
      providerId: dbProviderId ?? null
    })
    .onConflict((oc) =>
      oc.columns(['userId', 'teamId', 'query', 'service']).doUpdateSet((eb) => ({
        query: eb.ref('excluded.query'),
        lastUsedAt: sql`CURRENT_TIMESTAMP`
      }))
    )
    .executeTakeFirstOrThrow()

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
