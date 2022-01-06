import getPg from '../getPg'
import {IntegrationProviderServiceEnum} from './generated/getIntegrationProvidersByIdsQuery'
import {
  getIntegrationTokenQuery,
  IGetIntegrationTokenQueryResult
} from './generated/getIntegrationTokenQuery'
import {IntegrationTokenMetadata} from './upsertIntegrationToken'

export interface IIntegrationToken extends Omit<IGetIntegrationTokenQueryResult, 'tokenMetadata'> {
  tokenMetadata: IntegrationTokenMetadata
}

const getIntegrationToken = async (
  service: IntegrationProviderServiceEnum,
  teamId: string,
  userId: string
) => {
  const [res] = await getIntegrationTokenQuery.run({service, teamId, userId}, getPg())
  return res as IIntegrationToken
}

export default getIntegrationToken
