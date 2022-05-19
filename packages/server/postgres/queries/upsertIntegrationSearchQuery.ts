import getPg from '../getPg'
import {IntegrationProviderServiceEnum} from './generated/getIntegrationProvidersByIdsQuery'
import {upsertIntegrationSearchQueryQuery} from './generated/upsertIntegrationSearchQueryQuery'
import {upsertIntegrationSearchQueryWithProviderIdQuery} from './generated/upsertIntegrationSearchQueryWithProviderIdQuery'

interface IUpsertIntegrationSearchQueryInput {
  userId: string
  teamId: string
  service: IntegrationProviderServiceEnum
  query: object
  providerId: number | null
}
const upsertIntegrationSearchQuery = async (query: IUpsertIntegrationSearchQueryInput) => {
  const {providerId} = query
  const upsertQuery =
    providerId === null
      ? upsertIntegrationSearchQueryQuery
      : upsertIntegrationSearchQueryWithProviderIdQuery
  const result = await upsertQuery.run(query as any, getPg())

  return result[0]
}

export default upsertIntegrationSearchQuery
