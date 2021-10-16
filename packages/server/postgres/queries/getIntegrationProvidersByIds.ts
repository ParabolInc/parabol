import {
  IntegrationProvidersEnum as _IntegrationProvidersEnum,
  getIntegrationProvidersByIdsQuery,
  IGetIntegrationProvidersByIdsQueryResult
} from './generated/getIntegrationProvidersByIdsQuery'
import getPg from '../getPg'

export type IntegrationProvidersEnum = _IntegrationProvidersEnum
export interface IntegrationProvider extends IGetIntegrationProvidersByIdsQueryResult {}

const getIntegrationProvidersByIds = async (ids: readonly number[]) => {
  return await getIntegrationProvidersByIdsQuery.run({ids}, getPg())
}

export default getIntegrationProvidersByIds
