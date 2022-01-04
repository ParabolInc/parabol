import getPg from '../getPg'
import {
  IInsertIntegrationProviderQueryParams,
  insertIntegrationProviderQuery
} from './generated/insertIntegrationProviderQuery'

const insertIntegrationProvider = async (provider: IInsertIntegrationProviderQueryParams) => {
  const result = await insertIntegrationProviderQuery.run(provider, getPg())
  return result[0].id
}

export default insertIntegrationProvider
