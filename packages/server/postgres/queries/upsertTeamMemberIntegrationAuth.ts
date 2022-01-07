import getPg from '../getPg'
import {
  IntegrationProviderServiceEnum,
  upsertTeamMemberIntegrationAuthQuery
} from './generated/upsertTeamMemberIntegrationAuthQuery'

interface ITeamMemberIntegrationAuthWebhookInput {
  service: IntegrationProviderServiceEnum
  providerId: number
  teamId: string
  userId: string
}

interface ITeamMemberIntegrationAuthOAuth2Input extends ITeamMemberIntegrationAuthWebhookInput {
  accessToken: string
  refreshToken: string
  scopes: string
}

type ITeamMemberIntegrationAuthInput =
  | ITeamMemberIntegrationAuthOAuth2Input
  | ITeamMemberIntegrationAuthWebhookInput

const upsertTeamMemberIntegrationAuth = async (auth: ITeamMemberIntegrationAuthInput) => {
  return upsertTeamMemberIntegrationAuthQuery.run({auth} as any, getPg())
}
export default upsertTeamMemberIntegrationAuth
