import getPg from '../getPg'
import {
  IntegrationProviderTypesEnum,
  getIntegrationTokensWithProviderQuery
} from './generated/getIntegrationTokensWithProviderQuery'
import {nestProviderOnDbToken} from './getIntegrationTokenWithProvider'

const getIntegrationTokensByTeamWithProvider = async (
  type: IntegrationProviderTypesEnum,
  teamId: string
) =>
  (
    await getIntegrationTokensWithProviderQuery.run(
      {type, teamId, userId: null, byUserId: false},
      getPg()
    )
  ).map(nestProviderOnDbToken)

export default getIntegrationTokensByTeamWithProvider
