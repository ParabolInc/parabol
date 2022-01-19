import getPg from '../getPg'
import {getBestTeamIntegrationAuthQuery} from './generated/getBestTeamIntegrationAuthQuery'
import {IntegrationProviderServiceEnum} from './generated/getIntegrationProvidersByIdsQuery'

const getBestTeamIntegrationAuth = async (
  service: IntegrationProviderServiceEnum,
  teamId: string,
  userId: string
) => {
  const [res] = await getBestTeamIntegrationAuthQuery.run({service, teamId, userId}, getPg())
  return res
}

export default getBestTeamIntegrationAuth
