import getPg from '../getPg'
import {
  IntegrationProvidersEnum,
  getIntegrationTokensWithProviderQuery
} from './generated/getIntegrationTokensWithProviderQuery'
import {nestProviderOnDbToken} from './getIntegrationTokenWithProvider'

const getIntegrationTokensByTeamWithProvider = async (
  providerType: IntegrationProvidersEnum,
  teamId: string
) =>
  (
    await getIntegrationTokensWithProviderQuery.run(
      {providerType, teamId, userId: null, byUserId: false},
      getPg()
    )
  ).map(nestProviderOnDbToken)

export default getIntegrationTokensByTeamWithProvider
