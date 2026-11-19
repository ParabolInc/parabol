import {sql} from 'kysely'
import getKysely from '../postgres/getKysely'
import type {Oauthscopeenum} from '../postgres/types/pg'
import hashRandomToken from '../utils/hashRandomToken'
import {isOAuthRefreshToken} from './credentials'
import insertOAuthRefreshToken from './insertOAuthRefreshToken'

interface Input {
  refreshToken: string
  clientId: string
  orgId: string
}

const rotateOAuthRefreshToken = async ({refreshToken, clientId, orgId}: Input) => {
  if (!isOAuthRefreshToken(refreshToken)) return null
  const tokenHash = hashRandomToken(refreshToken)
  return getKysely()
    .transaction()
    .execute(async (trx) => {
      // a retry within 30 seconds mints a sibling token rather than revoking the connection
      const rotated = await trx
        .updateTable('OAuthAPIRefreshToken')
        .set({rotatedAt: sql`coalesce("rotatedAt", now())`})
        .where('tokenHash', '=', tokenHash)
        .where('expiresAt', '>', sql<Date>`now()`)
        .where((eb) =>
          eb.or([
            eb('rotatedAt', 'is', null),
            eb('rotatedAt', '>', sql<Date>`now() - interval '30 seconds'`)
          ])
        )
        .where('grantId', 'in', (eb) =>
          eb.selectFrom('OAuthAPIGrant').select('id').where('clientId', '=', clientId)
        )
        .returning('grantId')
        .executeTakeFirst()
      if (!rotated) {
        await trx
          .deleteFrom('OAuthAPIGrant')
          .where('clientId', '=', clientId)
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
      const organizationUser = await trx
        .selectFrom('OrganizationUser')
        .select('id')
        .where('orgId', '=', orgId)
        .where('userId', '=', grant.userId)
        .where('removedAt', 'is', null)
        .executeTakeFirst()
      if (!organizationUser) {
        await trx.deleteFrom('OAuthAPIGrant').where('id', '=', grantId).execute()
        return null
      }
      const nextRefreshToken = await insertOAuthRefreshToken(trx, grantId)
      return {grantId, ...grant, refreshToken: nextRefreshToken}
    })
}

export default rotateOAuthRefreshToken
