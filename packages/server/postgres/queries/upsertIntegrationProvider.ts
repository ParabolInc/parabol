import getPg from '../getPg'
import {
  IntegrationProviderAuthStrategyEnum,
  IntegrationProviderScopeEnum,
  IntegrationProviderServiceEnum,
  upsertIntegrationProviderQuery
} from './generated/upsertIntegrationProviderQuery'

interface IUpsertIntegrationProviderInput {
  service: IntegrationProviderServiceEnum
  authStrategy: IntegrationProviderAuthStrategyEnum
  scope?: IntegrationProviderScopeEnum
  clientId?: string
  tenantId?: string
  clientSecret?: string
  serverBaseUrl?: string
  webhookUrl?: string
  teamId: string
}
const upsertIntegrationProvider = async (provider: IUpsertIntegrationProviderInput) => {
  const result = await upsertIntegrationProviderQuery.run(provider as any, getPg())
  // guaranteed result because upsert will always result in a row
  return result[0]!.id
}

export default upsertIntegrationProvider
