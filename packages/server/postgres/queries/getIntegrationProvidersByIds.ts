import {getIntegrationProvidersByIdsQuery} from './generated/getIntegrationProvidersByIdsQuery'
import getPg from '../getPg'
import {IntegrationProvider} from '../types/IIntegrationProviderAndToken'

const getIntegrationProvidersByIds = async (
  ids: readonly number[]
): Promise<IntegrationProvider[]> => {
  return getIntegrationProvidersByIdsQuery.run({ids}, getPg())
}

export default getIntegrationProvidersByIds
