import getPg from '../getPg'
import {
  upsertIntegrationSearchQueryQuery
} from './generated/upsertIntegrationSearchQueryQuery'
import { IntegrationProviderServiceEnum } from "./generated/getIntegrationProvidersByIdsQuery";

interface IUpsertIntegrationSearchQueryInput {
  userId: string,
  teamId: string,
  service: IntegrationProviderServiceEnum,
  query: object
}
const upsertIntegrationSearchQuery = async (query: IUpsertIntegrationSearchQueryInput) => {
  const result = await upsertIntegrationSearchQueryQuery.run(query as any, getPg())
  // guaranteed result because upsert will always result in a row
  return result[0]
}

export default upsertIntegrationSearchQuery
