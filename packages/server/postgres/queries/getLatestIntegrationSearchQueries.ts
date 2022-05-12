import getPg from '../getPg'
import {getLatestIntegrationSearchQueriesQuery} from './generated/getLatestIntegrationSearchQueriesQuery'
import { IntegrationProviderServiceEnum } from "./generated/getIntegrationProvidersByIdsQuery";


interface Params {
  teamId: string
  userId: string
  service: IntegrationProviderServiceEnum
}

const getLatestIntegrationSearchQueries = async (params: Params) => {
  return getLatestIntegrationSearchQueriesQuery.run(params, getPg())
}

export default getLatestIntegrationSearchQueries
