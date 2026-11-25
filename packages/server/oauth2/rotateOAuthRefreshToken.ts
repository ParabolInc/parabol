import {sql} from 'kysely'
import getKysely from '../postgres/getKysely'
import type {Oauthscopeenum} from '../postgres/types/pg'
import hashRandomToken from '../utils/hashRandomToken'
import {isOAuthRefreshToken} from './credentials'
import insertOAuthRefreshToken from './insertOAuthRefreshToken'

interface Input {
  refreshToken: string
  clientId: string
}

const rotateOAuthRefreshToken = async ({refreshToken, clientId}: Input) => {
  if (!isOAuthRefreshToken(refreshToken)) return null
  const tokenHash = hashRandomToken(refreshToken)
  return getKysely()
    .transaction()
    .execute(async (trx) => {
      // lock the grant in its own statement, so the token read below sees a rotation that committed while this one waited
      const lockedGrant = await trx
        .selectFrom('OAuthAPIGrant')
        .select('id')
        .where('clientId', '=', clientId)
        .where('id', '=', (eb) =>
          eb.selectFrom('OAuthAPIRefreshToken').select('grantId').where('tokenHash', '=', tokenHash)
        )
        .forUpdate()
        .executeTakeFirst()
      if (!lockedGrant) return null
      const grantId = lockedGrant.id
      const token = await trx
        .selectFrom('OAuthAPIRefreshToken')
        .select((eb) => [
          'id',
          'parentId',
          'rotatedAt',
          sql<boolean>`"expiresAt" > now()`.as('isUnexpired'),
          sql<boolean>`"rotatedAt" > now() - interval '30 seconds'`.as('isInRetryWindow'),
          eb
            .exists(
              eb
                .selectFrom('OAuthAPIRefreshToken as child')
                .select('child.id')
                .whereRef('child.parentId', '=', 'OAuthAPIRefreshToken.id')
                .where('child.rotatedAt', 'is', null)
            )
            .as('hasUnusedChild')
        ])
        .where('tokenHash', '=', tokenHash)
        .executeTakeFirst()
      if (!token) return null
      // a retry within 30 seconds, before its new token is used, mints a sibling; the first sibling used revokes the rest
      const isRetry = !!token.rotatedAt && token.isInRetryWindow && token.hasUnusedChild
      if (token.rotatedAt && !isRetry) {
        await trx.deleteFrom('OAuthAPIGrant').where('id', '=', grantId).execute()
        return null
      }
      if (!token.isUnexpired) return null
      if (!token.rotatedAt) {
        const {parentId} = token
        await trx
          .updateTable('OAuthAPIRefreshToken')
          .set({rotatedAt: sql`now()`})
          .where('rotatedAt', 'is', null)
          .where((eb) =>
            parentId === null
              ? eb('id', '=', token.id)
              : eb.or([eb('id', '=', token.id), eb('parentId', '=', parentId)])
          )
          .execute()
      }
      const grant = await trx
        .updateTable('OAuthAPIGrant')
        .set({lastUsedAt: sql`now()`})
        .where('id', '=', grantId)
        .returning(['userId', 'resource', sql<Oauthscopeenum[]>`to_json(scopes)`.as('scopes')])
        .executeTakeFirstOrThrow()
      const nextRefreshToken = await insertOAuthRefreshToken(trx, grantId, token.id)
      return {grantId, ...grant, refreshToken: nextRefreshToken}
    })
}

export default rotateOAuthRefreshToken
