import getPg from '../getPg'
import {
  upsertIntegrationSearchQueryWithProviderIdQuery
} from './generated/upsertIntegrationSearchQueryWithProviderIdQuery'
import { IntegrationProviderServiceEnum } from "./generated/getIntegrationProvidersByIdsQuery";

interface IUpsertIntegrationSearchQueryInput {
  userId: string,
  teamId: string,
  service: IntegrationProviderServiceEnum,
  query: object
  providerId: number
}
const upsertIntegrationSearchQueryWithProviderId = async (query: IUpsertIntegrationSearchQueryInput) => {
  const result = await upsertIntegrationSearchQueryWithProviderIdQuery.run(query as any, getPg())
  // guaranteed result because upsert will always result in a row
  return result[0]
}

export default upsertIntegrationSearchQueryWithProviderId
