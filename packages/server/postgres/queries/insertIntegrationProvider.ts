import getPg from '../getPg'
import {
  IInsertIntegrationProviderQueryParams,
  insertIntegrationProviderQuery
} from './generated/insertIntegrationProviderQuery'

const insertIntegrationProvider = async (provider: IInsertIntegrationProviderQueryParams) =>
  insertIntegrationProviderQuery.run(provider, getPg())

export default insertIntegrationProvider
