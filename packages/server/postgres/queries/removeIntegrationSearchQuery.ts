import getPg from '../getPg'
import {removeIntegrationSearchQueryQuery} from './generated/removeIntegrationSearchQueryQuery'

const removeIntegrationSearchQuery = async (id: number, userId: string, teamId: string) => {
  return removeIntegrationSearchQueryQuery.run({id, userId, teamId}, getPg())
}
export default removeIntegrationSearchQuery
