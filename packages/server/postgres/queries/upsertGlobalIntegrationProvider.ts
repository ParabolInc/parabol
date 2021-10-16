import getPg from '../getPg'
import {
  IUpsertGlobalIntegrationProviderQueryParams,
  upsertGlobalIntegrationProviderQuery
} from './generated/upsertGlobalIntegrationProviderQuery'

const upsertGlobalIntegrationProvider = async (
  provider: IUpsertGlobalIntegrationProviderQueryParams
) => {
  await upsertGlobalIntegrationProviderQuery.run(provider, getPg())
}
export default upsertGlobalIntegrationProvider
