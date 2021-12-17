import {MaybeReadonly} from '../../../client/types/generics'
import getPg from '../getPg'
import {getIntegrationProvidersQuery} from './generated/getIntegrationProvidersQuery'
import {
  IntegrationProvider,
  IntegrationProviderTypesEnum,
  mapToIntegrationProviderMetadata
} from '../types/IntegrationProvider'

const getIntegrationProviders = async (
  type: MaybeReadonly<IntegrationProviderTypesEnum>,
  teamId: MaybeReadonly<string>,
  orgId: MaybeReadonly<string>
): Promise<IntegrationProvider[]> => {
  const providers = await getIntegrationProvidersQuery.run({type, teamId, orgId}, getPg())
  return providers.map((provider) => ({
    ...provider,
    providerMetadata: mapToIntegrationProviderMetadata(
      provider.tokenType,
      provider.providerMetadata
    )
  }))
}

export default getIntegrationProviders
