import getPg from '../getPg'
import {getLatestIntegrationSearchQueriesWithProviderIdQuery} from './generated/getLatestIntegrationSearchQueriesWithProviderIdQuery'
import { IntegrationProviderServiceEnum } from "./generated/getIntegrationProvidersByIdsQuery";


interface Params {
  teamId: string
  userId: string
  providerId: number
  service: IntegrationProviderServiceEnum
}

const getLatestIntegrationSearchQueriesWithProviderId = async (params: Params) => {
  return getLatestIntegrationSearchQueriesWithProviderIdQuery.run(params, getPg())
}

export default getLatestIntegrationSearchQueriesWithProviderId
