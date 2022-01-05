import getPg from '../getPg'
import {IntegrationProviderServiceEnum} from './generated/getIntegrationProvidersByIdsQuery'
import {getIntegrationTokenQuery} from './generated/getIntegrationTokenQuery'

const getIntegrationToken = async (
  service: IntegrationProviderServiceEnum,
  teamId: string,
  userId: string
) => {
  const [res] = await getIntegrationTokenQuery.run({service, teamId, userId}, getPg())
  return res
}

export default getIntegrationToken
