import {
  IntegrationProviderTypesEnum as _IntegrationProviderTypesEnum,
  getIntegrationProvidersByIdsQuery,
  IGetIntegrationProvidersByIdsQueryResult
} from './generated/getIntegrationProvidersByIdsQuery'
import getPg from '../getPg'

export type IntegrationProviderTypesEnum = _IntegrationProviderTypesEnum
export interface IntegrationProvider extends IGetIntegrationProvidersByIdsQueryResult {}

const getIntegrationProvidersByIds = async (ids: readonly number[]) => {
  return await getIntegrationProvidersByIdsQuery.run({ids}, getPg())
}

export default getIntegrationProvidersByIds
