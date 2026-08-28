import {sql} from 'kysely'
import IntegrationProviderId from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {
  getServerIntegration,
  isRegisteredServerIntegration
} from '../../../integrations/platform/registry'
import type {ServerIntegrationDefinition} from '../../../integrations/platform/ServerIntegrationDefinition'
import getKysely from '../../../postgres/getKysely'
import type {JsonObject} from '../../../postgres/types/pg'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const MAX_META_LENGTH = 4096

const isJsonObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const parseMeta = (meta: string | null | undefined): JsonObject | Error => {
  if (!meta) return {}
  if (meta.length > MAX_META_LENGTH) {
    return new Error(`meta must be at most ${MAX_META_LENGTH} characters`)
  }
  try {
    const parsed: unknown = JSON.parse(meta)
    return isJsonObject(parsed) ? parsed : new Error('meta must be a JSON object')
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

  if (!isRegisteredServerIntegration(service)) {
    return {error: {message: `${service} does not save search queries`}}
  }
  const definition: ServerIntegrationDefinition = getServerIntegration(service)
  const issueSearch = definition.capabilities.issueSearch
  if (!issueSearch?.persistQueries) {
    return {error: {message: `${service} does not save search queries`}}
  }
  if (!(await definition.isConnected({dataLoader, teamId, userId: viewerId}))) {
    return {error: {message: `Not connected to ${definition.title}`}}
  }
  const query = issueSearch.buildQuery(queryString, parsedMeta)
  if (query instanceof Error) return {error: {message: query.message}}

  await getKysely()
    .insertInto('IntegrationSearchQuery')
    .values({userId: viewerId, teamId, service, providerId: dbProviderId, query})
    .onConflict((oc) =>
      oc
        .columns(['userId', 'teamId', 'service', 'query', 'providerId'])
        .where('providerId', 'is not', null)
        .doUpdateSet({lastUsedAt: sql`CURRENT_TIMESTAMP`})
    )
    .execute()

  const data = {teamId, userId: viewerId, service}
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
