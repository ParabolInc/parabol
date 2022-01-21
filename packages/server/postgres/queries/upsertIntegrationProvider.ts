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
  clientSecret?: string
  serverBaseUrl?: string
  webhookUrl?: string
  teamId: string
}
const upsertIntegrationProvider = async (provider: IUpsertIntegrationProviderInput) => {
  const result = await upsertIntegrationProviderQuery.run(provider as any, getPg())
  return result[0].id
}

export default upsertIntegrationProvider
