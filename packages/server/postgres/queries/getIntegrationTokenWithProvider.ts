import getPg from '../getPg'
import {getIntegrationTokensWithProviderQuery} from './generated/getIntegrationTokensWithProviderQuery'
import {mapToIntegrationProviderMetadata} from '../types/IntegrationProvider'
import {
  IntegrationTokenWithProvider,
  nestIntegrationProviderOnIntegrationToken
} from '../types/IntegrationTokenWithProvider'
import {IntegrationProvidersEnum} from './generated/getIntegrationProvidersByIdsQuery'

const getIntegrationTokenWithProvider = async (
  provider: IntegrationProvidersEnum,
  teamId: string,
  userId: string
): Promise<IntegrationTokenWithProvider> => {
  const [res] = await getIntegrationTokensWithProviderQuery.run(
    {provider, teamId, userId, byUserId: true},
    getPg()
  )
  const tokenWithProvider = nestIntegrationProviderOnIntegrationToken(res)
  const {provider: integrationProvider} = tokenWithProvider
  return {
    ...tokenWithProvider,
    provider: {
      ...integrationProvider,
      providerMetadata: mapToIntegrationProviderMetadata(
        integrationProvider.type,
        integrationProvider.providerMetadata
      )
    }
  }
}

export default getIntegrationTokenWithProvider
