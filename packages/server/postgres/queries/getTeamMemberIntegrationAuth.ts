import getPg from '../getPg'
import {IntegrationProviderServiceEnum} from './generated/getIntegrationProvidersByIdsQuery'
import {getTeamMemberIntegrationAuthQuery} from './generated/getTeamMemberIntegrationAuthQuery'

const getTeamMemberIntegrationAuth = async (
  service: IntegrationProviderServiceEnum,
  teamId: string,
  userId: string
) => {
  const [res] = await getTeamMemberIntegrationAuthQuery.run({service, teamId, userId}, getPg())
  return res
}
export default getTeamMemberIntegrationAuth
