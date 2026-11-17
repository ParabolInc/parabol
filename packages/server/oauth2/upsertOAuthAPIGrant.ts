import getKysely from '../postgres/getKysely'
import type {Oauthscopeenum} from '../postgres/types/pg'
import {
  formatOAuthRefreshToken,
  generateOAuthRefreshSecret,
  oauthRefreshTokenExpiresAt
} from './credentials'

interface Input {
  clientId: string
  userId: string
  scopes: Oauthscopeenum[]
  grantedOrgIds: string[] | null
}

const upsertOAuthAPIGrant = async ({clientId, userId, scopes, grantedOrgIds}: Input) => {
  const {secret, secretHash} = generateOAuthRefreshSecret()
  const {id} = await getKysely()
    .insertInto('OAuthAPIGrant')
    .values({
      clientId,
      userId,
      scopes,
      grantedOrgIds,
      refreshTokenHash: secretHash,
      refreshTokenExpiresAt: oauthRefreshTokenExpiresAt
    })
    .onConflict((oc) =>
      oc.columns(['clientId', 'userId']).doUpdateSet((eb) => ({
        scopes: eb.ref('excluded.scopes'),
        grantedOrgIds: eb.ref('excluded.grantedOrgIds'),
        refreshTokenHash: eb.ref('excluded.refreshTokenHash'),
        refreshTokenExpiresAt: eb.ref('excluded.refreshTokenExpiresAt'),
        revokedAt: null
      }))
    )
    .returning('id')
    .executeTakeFirstOrThrow()
  return {grantId: id, refreshToken: formatOAuthRefreshToken(id, secret)}
}

export default upsertOAuthAPIGrant
