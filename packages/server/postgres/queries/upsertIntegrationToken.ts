import getPg from '../getPg'
import {
  IntegrationProviderServiceEnum,
  upsertIntegrationTokenQuery
} from './generated/upsertIntegrationTokenQuery'

interface IIntegrationTokenWebhookInput {
  service: IntegrationProviderServiceEnum
  providerId: number
  teamId: string
  userId: string
}

interface IIntegrationTokenOAuth2Input extends IIntegrationTokenWebhookInput {
  accessToken: string
  refreshToken: string
  scopes: string
}

type IIntegrationTokenInput = IIntegrationTokenOAuth2Input | IIntegrationTokenWebhookInput

const upsertIntegrationToken = async (auth: IIntegrationTokenInput) => {
  return upsertIntegrationTokenQuery.run({auth} as any, getPg())
}
export default upsertIntegrationToken
