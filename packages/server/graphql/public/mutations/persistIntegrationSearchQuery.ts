import {sql} from 'kysely'
import IntegrationProviderId from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const persistIntegrationSearchQuery: MutationResolvers['persistIntegrationSearchQuery'] = async (
  _source,
  {teamId, service, providerId, jiraServerSearchQuery, jiraSearchQuery, githubSearchQuery},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  const query =
    service === 'jiraServer'
      ? jiraServerSearchQuery
      : service === 'jira'
        ? jiraSearchQuery && {
            queryString: jiraSearchQuery.queryString,
            isJQL: jiraSearchQuery.isJQL,
            projectKeyFilters: [...(jiraSearchQuery.projectKeyFilters ?? [])].sort()
          }
        : service === 'github'
          ? githubSearchQuery && {queryString: githubSearchQuery.queryString.toLowerCase().trim()}
          : null
  if (!query) return {error: {message: `Missing search query for ${service}`}}

  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const providers = await dataLoader
    .get('sharedIntegrationProviders')
    .load({service, orgIds: [team.orgId], teamIds: [teamId]})
  const dbProviderId = providerId
    ? IntegrationProviderId.split(providerId)
    : (providers.find((provider) => provider.scope === 'global')?.id ?? null)
  if (dbProviderId && !providers.some((provider) => provider.id === dbProviderId)) {
    return {error: {message: 'Provider does not exist'}}
  }

  await getKysely()
    .insertInto('IntegrationSearchQuery')
    .values({userId: viewerId, teamId, service, query, providerId: dbProviderId})
    .onConflict((oc) =>
      dbProviderId === null
        ? oc
            .columns(['userId', 'teamId', 'service', 'query'])
            .where('providerId', 'is', null)
            .doUpdateSet({lastUsedAt: sql`CURRENT_TIMESTAMP`})
        : oc
            .columns(['userId', 'teamId', 'service', 'query', 'providerId'])
            .where('providerId', 'is not', null)
            .doUpdateSet({lastUsedAt: sql`CURRENT_TIMESTAMP`})
    )
    .execute()

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
