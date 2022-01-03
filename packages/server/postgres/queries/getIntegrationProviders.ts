import {MaybeReadonly} from '../../../client/types/generics'
import getPg from '../getPg'
import {getIntegrationProvidersQuery} from './generated/getIntegrationProvidersQuery'
import {IntegrationProvider, mapToIntegrationProviderMetadata} from '../types/IntegrationProvider'
import {IntegrationProvidersEnum} from './generated/getIntegrationProvidersByIdsQuery'

const getIntegrationProviders = async (
  provider: MaybeReadonly<IntegrationProvidersEnum>,
  teamId: MaybeReadonly<string>,
  orgId: MaybeReadonly<string>
): Promise<IntegrationProvider[]> => {
  const providers = await getIntegrationProvidersQuery.run({provider, teamId, orgId}, getPg())
  return providers.map((provider) => ({
    ...provider,
    providerMetadata: mapToIntegrationProviderMetadata(provider.type, provider.providerMetadata)
  }))
}

export default getIntegrationProviders
