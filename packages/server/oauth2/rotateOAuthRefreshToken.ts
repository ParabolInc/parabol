import {sql} from 'kysely'
import getKysely from '../postgres/getKysely'
import type {Oauthscopeenum} from '../postgres/types/pg'
import {hashOAuthRefreshToken, isOAuthRefreshToken} from './credentials'
import insertOAuthRefreshToken from './insertOAuthRefreshToken'

const rotateOAuthRefreshToken = async (refreshToken: string, clientId: string) => {
  if (!isOAuthRefreshToken(refreshToken)) return null
  const tokenHash = hashOAuthRefreshToken(refreshToken)
  return getKysely()
    .transaction()
    .execute(async (trx) => {
      const rotated = await trx
        .updateTable('OAuthAPIRefreshToken')
        .set({rotatedAt: sql`now()`})
        .where('tokenHash', '=', tokenHash)
        .where('rotatedAt', 'is', null)
        .where('expiresAt', '>', sql<Date>`now()`)
        .where('grantId', 'in', (eb) =>
          eb
            .selectFrom('OAuthAPIGrant')
            .select('id')
            .where('clientId', '=', clientId)
            .where('revokedAt', 'is', null)
        )
        .returning('grantId')
        .executeTakeFirst()
      if (!rotated) {
        await trx
          .updateTable('OAuthAPIGrant')
          .set({revokedAt: sql`now()`})
          .where('clientId', '=', clientId)
          .where('revokedAt', 'is', null)
          .where('id', 'in', (eb) =>
            eb
              .selectFrom('OAuthAPIRefreshToken')
              .select('grantId')
              .where('tokenHash', '=', tokenHash)
              .where('rotatedAt', 'is not', null)
          )
          .execute()
        return null
      }
      const {grantId} = rotated
      const grant = await trx
        .updateTable('OAuthAPIGrant')
        .set({lastUsedAt: sql`now()`})
        .where('id', '=', grantId)
        .returning(['userId', 'resource', sql<Oauthscopeenum[]>`to_json(scopes)`.as('scopes')])
        .executeTakeFirstOrThrow()
      const nextRefreshToken = await insertOAuthRefreshToken(trx, grantId)
      return {grantId, ...grant, refreshToken: nextRefreshToken}
    })
}

export default rotateOAuthRefreshToken
