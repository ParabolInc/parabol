import getPg from '../getPg'
import {IntegrationProviderServiceEnum} from './generated/getIntegrationProvidersByIdsQuery'
import {
  getTeamMemberIntegrationAuthQuery,
  IGetTeamMemberIntegrationAuthQueryResult
} from './generated/getTeamMemberIntegrationAuthQuery'

export type TeamMemberIntegrationAuth = IGetTeamMemberIntegrationAuthQueryResult

const getTeamMemberIntegrationAuth = async (
  service: IntegrationProviderServiceEnum,
  teamId: string,
  userId: string
) => {
  const [res] = await getTeamMemberIntegrationAuthQuery.run({service, teamId, userId}, getPg())
  return res ?? null
}
export default getTeamMemberIntegrationAuth
