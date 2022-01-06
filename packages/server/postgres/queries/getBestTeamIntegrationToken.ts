import getPg from '../getPg'
import {getBestTeamIntegrationTokenQuery} from './generated/getBestTeamIntegrationTokenQuery'
import {IntegrationProviderServiceEnum} from './generated/getIntegrationProvidersByIdsQuery'
import {IIntegrationToken} from './getIntegrationToken'

const getBestTeamIntegrationToken = async (
  service: IntegrationProviderServiceEnum,
  teamId: string,
  userId: string
) => {
  const [res] = await getBestTeamIntegrationTokenQuery.run({service, teamId, userId}, getPg())
  return res as unknown as IIntegrationToken
}

export default getBestTeamIntegrationToken
