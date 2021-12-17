import getPg from '../getPg'
import {
  IInsertIntegrationProviderWithTokenQueryParams,
  insertIntegrationProviderWithTokenQuery
} from './generated/insertIntegrationProviderWithTokenQuery'

const insertIntegrationProviderWithToken = async (
  providerWithToken: IInsertIntegrationProviderWithTokenQueryParams
) => insertIntegrationProviderWithTokenQuery.run(providerWithToken, getPg())

export default insertIntegrationProviderWithToken
