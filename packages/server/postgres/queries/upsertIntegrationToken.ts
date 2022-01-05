import getPg from '../getPg'
import {upsertIntegrationTokenQuery} from './generated/upsertIntegrationTokenQuery'

export type IntegrationTokenOAuth2Metadata = {
  accessToken: string
  refreshToken: string
  scopes: string
}
type IntegrationTokenWebhookMetadata = Record<string, never>

interface IAuth {
  providerId: number
  tokenMetadata: IntegrationTokenOAuth2Metadata | IntegrationTokenWebhookMetadata
  teamId: string
  userId: string
}

const upsertIntegrationToken = async (auth: IAuth) => {
  return upsertIntegrationTokenQuery.run({auth}, getPg())
}
export default upsertIntegrationToken
