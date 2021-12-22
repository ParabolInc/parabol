import getPg from '../getPg'
import {mapToIntegrationProviderMetadata} from '../types/IntegrationProvider'
import {
  IntegrationTokenWithProvider,
  nestIntegrationProviderOnIntegrationToken
} from '../types/IntegrationTokenWithProvider'
import {IntegrationProvidersEnum} from './generated/getIntegrationProvidersByIdsQuery'
import {getIntegrationTokensWithProviderQuery} from './generated/getIntegrationTokensWithProviderQuery'

const getIntegrationTokensByTeamWithProvider = async (
  provider: IntegrationProvidersEnum,
  teamId: string
): Promise<IntegrationTokenWithProvider[]> =>
  (
    await getIntegrationTokensWithProviderQuery.run(
      {provider, teamId, userId: null, byUserId: false},
      getPg()
    )
  )
    .map(nestIntegrationProviderOnIntegrationToken)
    .map((integrationTokenWithProvider) => ({
      ...integrationTokenWithProvider,
      provider: {
        ...integrationTokenWithProvider.provider,
        providerMetadata: mapToIntegrationProviderMetadata(
          integrationTokenWithProvider.provider.type,
          integrationTokenWithProvider.provider.providerMetadata
        )
      }
    }))

export default getIntegrationTokensByTeamWithProvider
