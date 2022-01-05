import getPg from '../getPg'
import {
  IUpdateIntegrationProviderQueryParams,
  updateIntegrationProviderQuery
} from './generated/updateIntegrationProviderQuery'
import {IntegrationProviderMetadata} from './getIntegrationProvidersByIds'

interface Params extends Omit<IUpdateIntegrationProviderQueryParams, 'providerMetadata'> {
  id: number
  providerMetadata: IntegrationProviderMetadata
}

const updateIntegrationProvider = async (params: Params) => {
  return updateIntegrationProviderQuery.run(params as any, getPg())
}
export default updateIntegrationProvider
