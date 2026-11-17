import {sql} from 'kysely'
import getKysely from '../postgres/getKysely'
import type {Oauthscopeenum} from '../postgres/types/pg'
import {
  formatOAuthRefreshToken,
  generateOAuthRefreshSecret,
  hashOAuthRefreshSecret,
  oauthRefreshTokenExpiresAt,
  parseOAuthRefreshToken
} from './credentials'

const rotateOAuthRefreshToken = async (refreshToken: string, clientId: string) => {
  const parsed = parseOAuthRefreshToken(refreshToken)
  if (!parsed) return null
  const {grantId} = parsed
  const presentedHash = hashOAuthRefreshSecret(parsed.secret)
  const {secret, secretHash} = generateOAuthRefreshSecret()
  const pg = getKysely()
  const rotated = await pg
    .updateTable('OAuthAPIGrant')
    .set({
      refreshTokenHash: secretHash,
      refreshTokenExpiresAt: oauthRefreshTokenExpiresAt,
      lastUsedAt: sql`now()`
    })
    .where('id', '=', grantId)
    .where('clientId', '=', clientId)
    .where('refreshTokenHash', '=', presentedHash)
    .where('revokedAt', 'is', null)
    .where('refreshTokenExpiresAt', '>', sql<Date>`now()`)
    .returning(['userId', sql<Oauthscopeenum[]>`to_json(scopes)`.as('scopes')])
    .executeTakeFirst()
  if (rotated) {
    return {
      grantId,
      userId: rotated.userId,
      scopes: rotated.scopes,
      refreshToken: formatOAuthRefreshToken(grantId, secret)
    }
  }
  await pg
    .updateTable('OAuthAPIGrant')
    .set({revokedAt: sql`now()`})
    .where('id', '=', grantId)
    .where('clientId', '=', clientId)
    .where('refreshTokenHash', '!=', presentedHash)
    .where('revokedAt', 'is', null)
    .execute()
  return null
}

export default rotateOAuthRefreshToken
