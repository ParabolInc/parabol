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
  scope?: IntegrationProviderScopeEnum | null | undefined
  clientId?: string
  tenantId?: string | null
  clientSecret?: string
  serverBaseUrl?: string
  sharedSecret?: string
  webhookUrl?: string
  teamId: string | null
  orgId: string | null
}

const upsertIntegrationProvider = async (provider: IUpsertIntegrationProviderInput) => {
  const result = await upsertIntegrationProviderQuery.run(provider as any, getPg())
  // guaranteed result because upsert will always result in a row
  return result[0]!.id
}

export default upsertIntegrationProvider
