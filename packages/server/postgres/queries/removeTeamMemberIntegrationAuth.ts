import getPg from '../getPg'
import {
  IntegrationProviderServiceEnum,
  removeTeamMemberIntegrationAuthQuery
} from './generated/removeTeamMemberIntegrationAuthQuery'

const removeTeamMemberIntegrationAuth = async (
  service: IntegrationProviderServiceEnum,
  teamId: string,
  userId: string
) => {
  await removeTeamMemberIntegrationAuthQuery.run({service, teamId, userId}, getPg())
}
export default removeTeamMemberIntegrationAuth
