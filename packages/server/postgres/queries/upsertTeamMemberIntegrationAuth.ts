import getKysely from '../getKysely'
import type {Integrationproviderserviceenum} from '../types/pg'

interface ITeamMemberIntegrationAuthBaseInput {
  service: Integrationproviderserviceenum
  providerId: number
  teamId: string
  userId: string
}

export interface ITeamMemberIntegrationAuthOAuth1Input extends ITeamMemberIntegrationAuthBaseInput {
  accessToken: string
  accessTokenSecret: string
}

export interface ITeamMemberIntegrationAuthOAuth2Input extends ITeamMemberIntegrationAuthBaseInput {
  accessToken: string
  refreshToken: string | undefined
  scopes: string
  expiresAt: Date | null
}

type ITeamMemberIntegrationAuthInput =
  | ITeamMemberIntegrationAuthOAuth1Input
  | ITeamMemberIntegrationAuthOAuth2Input
  | ITeamMemberIntegrationAuthBaseInput

const upsertTeamMemberIntegrationAuth = async (auth: ITeamMemberIntegrationAuthInput) => {
  return getKysely()
    .insertInto('TeamMemberIntegrationAuth')
    .values(auth)
    .onConflict((oc) =>
      oc.columns(['userId', 'teamId', 'service']).doUpdateSet((eb) => ({
        providerId: eb.ref('excluded.providerId'),
        accessToken: eb.ref('excluded.accessToken'),
        refreshToken: eb.ref('excluded.refreshToken'),
        scopes: eb.ref('excluded.scopes'),
        accessTokenSecret: eb.ref('excluded.accessTokenSecret'),
        expiresAt: eb.ref('excluded.expiresAt'),
        isActive: true
      }))
    )
    .execute()
}
export default upsertTeamMemberIntegrationAuth
