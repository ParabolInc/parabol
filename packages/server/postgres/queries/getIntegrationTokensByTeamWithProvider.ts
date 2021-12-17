import getPg from '../getPg'
import {
  IntegrationProviderTypesEnum,
  mapToIntegrationProviderMetadata
} from '../types/IntegrationProvider'
import {
  IntegrationTokenWithProvider,
  nestIntegrationProviderOnIntegrationToken
} from '../types/IntegrationTokenWithProvider'
import {getIntegrationTokensWithProviderQuery} from './generated/getIntegrationTokensWithProviderQuery'

const getIntegrationTokensByTeamWithProvider = async (
  type: IntegrationProviderTypesEnum,
  teamId: string
): Promise<IntegrationTokenWithProvider[]> =>
  (
    await getIntegrationTokensWithProviderQuery.run(
      {type, teamId, userId: null, byUserId: false},
      getPg()
    )
  )
    .map(nestIntegrationProviderOnIntegrationToken)
    .map((integrationTokenWithProvider) => ({
      ...integrationTokenWithProvider,
      provider: {
        ...integrationTokenWithProvider.provider,
        providerMetadata: mapToIntegrationProviderMetadata(
          integrationTokenWithProvider.provider.tokenType,
          integrationTokenWithProvider.provider.providerMetadata
        )
      }
    }))

export default getIntegrationTokensByTeamWithProvider
