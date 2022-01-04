import getPg from '../getPg'
import {IntegrationTokenWithProvider} from '../types/IntegrationTokenWithProvider'
import {IntegrationProvidersEnum} from './generated/getIntegrationProvidersByIdsQuery'
import {getIntegrationTokenQuery} from './generated/getIntegrationTokenQuery'

const getIntegrationToken = async (
  service: IntegrationProvidersEnum,
  teamId: string,
  userId: string
): Promise<IntegrationTokenWithProvider> => {
  const [res] = await getIntegrationTokenQuery.run({service, teamId, userId}, getPg())
  return res
}

export default getIntegrationToken
