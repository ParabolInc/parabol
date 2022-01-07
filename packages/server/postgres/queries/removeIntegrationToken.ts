import getPg from '../getPg'
import {
  IntegrationProviderServiceEnum,
  removeIntegrationTokenQuery
} from './generated/removeIntegrationTokenQuery'

const removeIntegrationToken = async (
  service: IntegrationProviderServiceEnum,
  teamId: string,
  userId: string
) => {
  await removeIntegrationTokenQuery.run({service, teamId, userId}, getPg())
}
export default removeIntegrationToken
