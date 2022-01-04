import getPg from '../getPg'
import {upsertIntegrationTokenQuery} from './generated/upsertIntegrationTokenQuery'

type OAuth2TokenMetadata = {
  accessToken: string
  refreshToken: string
  scopes: string
}
type WebhookTokenMetadata = Record<string, never>

interface IAuth {
  providerId: number
  tokenMetadata: OAuth2TokenMetadata | WebhookTokenMetadata
  teamId: string
  userId: string
}

const upsertIntegrationToken = async (auth: IAuth) => {
  return upsertIntegrationTokenQuery.run({auth}, getPg())
}
export default upsertIntegrationToken
