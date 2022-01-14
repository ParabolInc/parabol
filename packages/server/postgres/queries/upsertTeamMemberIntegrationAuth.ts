import getPg from '../getPg'
import {
  IntegrationProviderServiceEnum,
  upsertTeamMemberIntegrationAuthQuery
} from './generated/upsertTeamMemberIntegrationAuthQuery'

interface ITeamMemberIntegrationAuthBaseInput {
  service: IntegrationProviderServiceEnum
  providerId: number
  teamId: string
  userId: string
}

export interface ITeamMemberIntegrationAuthOAuth2Input extends ITeamMemberIntegrationAuthBaseInput {
  accessToken: string
  refreshToken: string
  scopes: string
}

type ITeamMemberIntegrationAuthInput =
  | ITeamMemberIntegrationAuthOAuth2Input
  | ITeamMemberIntegrationAuthBaseInput

const upsertTeamMemberIntegrationAuth = async (auth: ITeamMemberIntegrationAuthInput) => {
  return upsertTeamMemberIntegrationAuthQuery.run({auth} as any, getPg())
}
export default upsertTeamMemberIntegrationAuth
