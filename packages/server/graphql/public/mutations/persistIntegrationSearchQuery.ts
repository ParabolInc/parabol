import {sql} from 'kysely'
import IntegrationProviderId from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import type {JsonObject} from '../../../postgres/types/pg'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const parseMeta = (meta: string | null | undefined): JsonObject | Error => {
  if (!meta) return {}
  try {
    const parsed: unknown = JSON.parse(meta)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as JsonObject)
      : new Error('meta must be a JSON object')
  } catch {
    return new Error('meta must be valid JSON')
  }
}

const persistIntegrationSearchQuery: MutationResolvers['persistIntegrationSearchQuery'] = async (
  _source,
  {teamId, providerId, queryString, meta},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  const parsedMeta = parseMeta(meta)
  if (parsedMeta instanceof Error) return {error: {message: parsedMeta.message}}

  const dbProviderId = IntegrationProviderId.split(providerId)
  const [provider, team] = await Promise.all([
    dataLoader.get('integrationProviders').load(dbProviderId),
    dataLoader.get('teams').loadNonNull(teamId)
  ])
  if (!provider) return {error: {message: 'Provider does not exist'}}
  const {service} = provider
  const providers = await dataLoader
    .get('sharedIntegrationProviders')
    .load({service, orgIds: [team.orgId], teamIds: [teamId]})
  if (!providers.some(({id}) => id === dbProviderId)) {
    return {error: {message: 'Provider is not available to this team'}}
  }

  await getKysely()
    .insertInto('IntegrationSearchQuery')
    .values({
      userId: viewerId,
      teamId,
      service,
      providerId: dbProviderId,
      query: {...parsedMeta, queryString}
    })
    .onConflict((oc) =>
      oc
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
