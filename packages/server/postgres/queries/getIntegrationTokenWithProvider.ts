import getPg from '../getPg'
import {getIntegrationTokensWithProviderQuery} from './generated/getIntegrationTokensWithProviderQuery'
import {
  IntegrationProviderTypesEnum,
  mapToIntegrationProviderMetadata
} from '../types/IntegrationProvider'
import {
  IntegrationTokenWithProvider,
  nestIntegrationProviderOnIntegrationToken
} from '../types/IntegrationTokenWithProvider'

const getIntegrationTokenWithProvider = async (
  type: IntegrationProviderTypesEnum,
  teamId: string,
  userId: string
): Promise<IntegrationTokenWithProvider> => {
  const [res] = await getIntegrationTokensWithProviderQuery.run(
    {type, teamId, userId, byUserId: true},
    getPg()
  )
  const tokenWithProvider = nestIntegrationProviderOnIntegrationToken(res)
  const {provider} = tokenWithProvider
  return {
    ...tokenWithProvider,
    provider: {
      ...provider,
      providerMetadata: mapToIntegrationProviderMetadata(
        provider.tokenType,
        provider.providerMetadata
      )
    }
  }
}

export default getIntegrationTokenWithProvider
