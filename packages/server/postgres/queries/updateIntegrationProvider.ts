import getPg from '../getPg'
import {
  IUpdateIntegrationProviderQueryParams,
  updateIntegrationProviderQuery
} from './generated/updateIntegrationProviderQuery'

const updateIntegrationProvider = async (params: IUpdateIntegrationProviderQueryParams) => {
  await updateIntegrationProviderQuery.run(params, getPg())
}
export default updateIntegrationProvider
