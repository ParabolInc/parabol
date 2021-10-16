import getPg from '../getPg'
import {removeIntegrationTokenQuery} from './generated/removeIntegrationTokenQuery'

const removeIntegrationToken = async (providerId: number, teamId: string, userId: string) => {
  await removeIntegrationTokenQuery.run({providerId, teamId, userId}, getPg())
}
export default removeIntegrationToken
