import getPg from '../getPg'
import type {Integrationproviderserviceenum} from '../types/pg'
import {getLatestIntegrationSearchQueriesQuery} from './generated/getLatestIntegrationSearchQueriesQuery'
import {getLatestIntegrationSearchQueriesWithProviderIdQuery} from './generated/getLatestIntegrationSearchQueriesWithProviderIdQuery'

interface Params {
  teamId: string
  userId: string
  providerId: number | null
  service: Integrationproviderserviceenum
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
