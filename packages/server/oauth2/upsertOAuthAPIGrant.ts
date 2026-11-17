import getKysely from '../postgres/getKysely'
import type {Oauthscopeenum} from '../postgres/types/pg'
import insertOAuthRefreshToken from './insertOAuthRefreshToken'

interface Input {
  clientId: string
  userId: string
  scopes: Oauthscopeenum[]
  grantedOrgIds: string[] | null
  resource: string | null
}

const upsertOAuthAPIGrant = async ({clientId, userId, scopes, grantedOrgIds, resource}: Input) =>
  getKysely()
    .transaction()
    .execute(async (trx) => {
      await trx
        .deleteFrom('OAuthAPIGrant')
        .where('clientId', '=', clientId)
        .where('userId', '=', userId)
        .where('revokedAt', 'is not', null)
        .execute()
      const {id: grantId} = await trx
        .insertInto('OAuthAPIGrant')
        .values({clientId, userId, scopes, grantedOrgIds, resource})
        .onConflict((oc) =>
          oc.columns(['clientId', 'userId']).doUpdateSet((eb) => ({
            scopes: eb.ref('excluded.scopes'),
            grantedOrgIds: eb.ref('excluded.grantedOrgIds'),
            resource: eb.ref('excluded.resource')
          }))
        )
        .returning('id')
        .executeTakeFirstOrThrow()
      const refreshToken = await insertOAuthRefreshToken(trx, grantId)
      return {grantId, refreshToken}
    })

export default upsertOAuthAPIGrant
