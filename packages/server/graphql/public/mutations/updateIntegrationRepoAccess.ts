import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import invalidateRepoIntegrationsCache from '../../../integrations/invalidateRepoIntegrationsCache'
import RepoAccess from '../../../integrations/platform/RepoAccess'
import {getServerIntegration} from '../../../integrations/platform/registry'
import type {ServerIntegrationDefinition} from '../../../integrations/platform/ServerIntegrationDefinition'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'
import {makeIntegrationServiceSource} from '../types/IntegrationService'

const MAX_SHARED_REPOS = 500

const updateIntegrationRepoAccess: MutationResolvers['updateIntegrationRepoAccess'] = async (
  _source,
  {teamId, service, integrationRepoIds},
  context,
  info
) => {
  const {authToken, dataLoader, socketId: mutatorId} = context
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // VALIDATION
  const definition: ServerIntegrationDefinition | null = getServerIntegration(service)
  const {repoAccess, repoList} = definition?.capabilities ?? {}
  if (!definition || !repoAccess || !repoList) {
    throw new GraphQLError(`${service} does not support choosing what to share`)
  }
  const ctx = {dataLoader, teamId, userId: viewerId, context, info}
  const auth = await definition.getAuthRow(ctx)
  if (!auth) throw new GraphQLError(`${definition.title} is not connected`)
  if (integrationRepoIds && integrationRepoIds.length > MAX_SHARED_REPOS) {
    throw new GraphQLError(`Share at most ${MAX_SHARED_REPOS} at a time, or share everything`)
  }

  const getAccess = async () => {
    if (!integrationRepoIds) return new RepoAccess('all', [])
    const wantedIds = new Set(integrationRepoIds.map((id) => id.toLowerCase()))
    if (wantedIds.size === 0) return new RepoAccess('selected', [])
    const availableRepos = await repoAccess.fetchAvailableRepos(ctx)
    // an id only counts if the viewer's own account lists it; one already shared is kept through an outage
    const visible = (availableRepos instanceof Error ? [] : availableRepos).map((repo) => ({
      id: repoList.integrationRepoId(repo),
      name: repoList.name(repo)
    }))
    const candidates = [...visible, ...RepoAccess.fromMeta(auth.meta).repos]
    const repos = [...wantedIds].flatMap(
      (wantedId) => candidates.find(({id}) => id.toLowerCase() === wantedId) ?? []
    )
    if (repos.length !== wantedIds.size) {
      throw new GraphQLError(
        availableRepos instanceof Error
          ? `Could not reach ${definition.title}: ${availableRepos.message}`
          : `Your ${definition.title} account cannot see everything you picked`
      )
    }
    return new RepoAccess('selected', repos)
  }
  const access = await getAccess()

  // RESOLUTION
  await getKysely()
    .updateTable('TeamMemberIntegrationAuth')
    .set({meta: JSON.stringify(access.toMeta())})
    .where('id', '=', auth.id)
    .execute()
  dataLoader.get('teamMemberIntegrationAuthsByServiceTeamAndUserId').clearAll()
  await invalidateRepoIntegrationsCache(teamId, viewerId, definition.service, 'removed')

  const data = {
    integrationService: makeIntegrationServiceSource(definition.service, teamId, viewerId)
  }
  publish(
    SubscriptionChannel.NOTIFICATION,
    viewerId,
    'IntegrationService',
    data.integrationService,
    subOptions
  )
  return data
}

export default updateIntegrationRepoAccess
