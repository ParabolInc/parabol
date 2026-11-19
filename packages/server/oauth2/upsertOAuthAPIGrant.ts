import getKysely from '../postgres/getKysely'
import type {Oauthscopeenum} from '../postgres/types/pg'
import insertOAuthRefreshToken from './insertOAuthRefreshToken'

interface Input {
  clientId: string
  userId: string
  scopes: Oauthscopeenum[]
  resource: string | null
}

const upsertOAuthAPIGrant = async ({clientId, userId, scopes, resource}: Input) =>
  getKysely()
    .transaction()
    .execute(async (trx) => {
      const {id: grantId} = await trx
        .insertInto('OAuthAPIGrant')
        .values({clientId, userId, scopes, resource})
        .onConflict((oc) =>
          oc.columns(['clientId', 'userId']).doUpdateSet((eb) => ({
            scopes: eb.ref('excluded.scopes'),
            resource: eb.ref('excluded.resource')
          }))
        )
        .returning('id')
        .executeTakeFirstOrThrow()
      const refreshToken = await insertOAuthRefreshToken(trx, grantId)
      return {grantId, refreshToken}
    })

export default upsertOAuthAPIGrant
