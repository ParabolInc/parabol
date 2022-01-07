import getPg from '../getPg'
import {getBestTeamIntegrationTokenQuery} from './generated/getBestTeamIntegrationTokenQuery'
import {IntegrationProviderServiceEnum} from './generated/getIntegrationProvidersByIdsQuery'

const getBestTeamIntegrationToken = async (
  service: IntegrationProviderServiceEnum,
  teamId: string,
  userId: string
) => {
  const [res] = await getBestTeamIntegrationTokenQuery.run({service, teamId, userId}, getPg())
  return res
}

export default getBestTeamIntegrationToken
