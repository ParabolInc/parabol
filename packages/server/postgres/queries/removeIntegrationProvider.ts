import getPg from '../getPg'
import {removeIntegrationProviderQuery} from './generated/removeIntegrationProviderQuery'

const removeIntegrationProvider = async (id: number) => {
  await removeIntegrationProviderQuery.run({id}, getPg())
}
export default removeIntegrationProvider
