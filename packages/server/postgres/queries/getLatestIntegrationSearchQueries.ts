import getPg from '../getPg'
import {IntegrationProviderServiceEnum} from './generated/getIntegrationProvidersByIdsQuery'
import {getLatestIntegrationSearchQueriesQuery} from './generated/getLatestIntegrationSearchQueriesQuery'
import {getLatestIntegrationSearchQueriesWithProviderIdQuery} from './generated/getLatestIntegrationSearchQueriesWithProviderIdQuery'

interface Params {
  teamId: string
  userId: string
  providerId: number | null
  service: IntegrationProviderServiceEnum
}

const getLatestIntegrationSearchQueries = async (params: Params) => {
  const {providerId} = params
  const query =
    providerId === null
      ? getLatestIntegrationSearchQueriesQuery
      : getLatestIntegrationSearchQueriesWithProviderIdQuery
  return query.run(params, getPg())
}

export default getLatestIntegrationSearchQueries
