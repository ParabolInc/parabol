import getPg from '../getPg'
import {
  IntegrationProviderServiceEnum,
  upsertIntegrationTokenQuery
} from './generated/upsertIntegrationTokenQuery'

export type IntegrationTokenOAuth2Metadata = {
  accessToken: string
  refreshToken: string
  scopes: string
}
export type IntegrationTokenWebhookMetadata = Record<string, never>

export type IntegrationTokenMetadata =
  | IntegrationTokenOAuth2Metadata
  | IntegrationTokenWebhookMetadata
interface IIntegrationTokenInput {
  service: IntegrationProviderServiceEnum
  providerId: number
  tokenMetadata: IntegrationTokenMetadata
  teamId: string
  userId: string
}

const upsertIntegrationToken = async (auth: IIntegrationTokenInput) => {
  return upsertIntegrationTokenQuery.run({auth}, getPg())
}
export default upsertIntegrationToken
