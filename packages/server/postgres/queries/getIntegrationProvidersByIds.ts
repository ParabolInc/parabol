import {getIntegrationProvidersByIdsQuery} from './generated/getIntegrationProvidersByIdsQuery'
import getPg from '../getPg'
import {IntegrationProvider, mapToIntegrationProviderMetadata} from '../types/IntegrationProvider'

const getIntegrationProvidersByIds = async (
  ids: readonly number[]
): Promise<IntegrationProvider[]> => {
  const providers = await getIntegrationProvidersByIdsQuery.run({ids}, getPg())
  return providers.map((provider) => ({
    ...provider,
    providerMetadata: mapToIntegrationProviderMetadata(
      provider.tokenType,
      provider.providerMetadata
    )
  }))
}

export default getIntegrationProvidersByIds
