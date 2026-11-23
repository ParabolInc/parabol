import getKysely from '../postgres/getKysely'
import type {Oauthscopeenum} from '../postgres/types/pg'
import insertOAuthRefreshToken from './insertOAuthRefreshToken'

interface Input {
  clientId: string
  userId: string
  scopes: Oauthscopeenum[]
  resource: string | null
  grantedOrgIds: string[] | null
  grantedTeamIds: string[] | null
  grantedPageIds: string[] | null
}

const upsertOAuthAPIGrant = async (grant: Input) =>
  getKysely()
    .transaction()
    .execute(async (trx) => {
      const {id: grantId} = await trx
        .insertInto('OAuthAPIGrant')
        .values(grant)
        .onConflict((oc) =>
          oc.columns(['clientId', 'userId']).doUpdateSet((eb) => ({
            scopes: eb.ref('excluded.scopes'),
            resource: eb.ref('excluded.resource'),
            grantedOrgIds: eb.ref('excluded.grantedOrgIds'),
            grantedTeamIds: eb.ref('excluded.grantedTeamIds'),
            grantedPageIds: eb.ref('excluded.grantedPageIds')
          }))
        )
        .returning('id')
        .executeTakeFirstOrThrow()
      const refreshToken = await insertOAuthRefreshToken(trx, grantId, null)
      return {grantId, refreshToken}
    })

export default upsertOAuthAPIGrant
