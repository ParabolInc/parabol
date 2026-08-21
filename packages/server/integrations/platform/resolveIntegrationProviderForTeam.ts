import IntegrationProviderId from '~/shared/gqlIds/IntegrationProviderId'
import type {DataLoaderWorker} from '../../graphql/graphql'
import type {TIntegrationProvider} from '../../postgres/types/IntegrationProvider'
import type {Integrationproviderserviceenum} from '../../postgres/types/pg'

interface ResolveIntegrationProviderForTeamArgs {
  providerId?: string | null
  service?: Integrationproviderserviceenum | null
  teamId: string
}

const resolveIntegrationProviderForTeam = async (
  dataLoader: DataLoaderWorker,
  {providerId, service, teamId}: ResolveIntegrationProviderForTeamArgs
): Promise<TIntegrationProvider | null> => {
  if (providerId) {
    const provider = await dataLoader
      .get('integrationProviders')
      .load(IntegrationProviderId.split(providerId))
    return provider ?? null
  }
  if (!service) return null
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const providers = await dataLoader
    .get('sharedIntegrationProviders')
    .load({service, orgIds: [team.orgId], teamIds: [teamId]})
  return providers.find((provider) => provider.scope === 'global') ?? null
}

export default resolveIntegrationProviderForTeam
