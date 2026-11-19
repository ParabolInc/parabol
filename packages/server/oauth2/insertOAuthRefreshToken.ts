import {type Kysely, sql} from 'kysely'
import type {DB} from '../postgres/types/pg'
import {generateOAuthRefreshToken} from './credentials'

const insertOAuthRefreshToken = async (db: Kysely<DB>, grantId: number) => {
  const {refreshToken, tokenHash} = generateOAuthRefreshToken()
  await db
    .deleteFrom('OAuthAPIRefreshToken')
    .where('id', 'in', (eb) =>
      eb
        .selectFrom('OAuthAPIRefreshToken')
        .select('id')
        .where('expiresAt', '<', sql<Date>`now()`)
        .limit(100)
        .forUpdate()
        .skipLocked()
    )
    .execute()
  await db
    .insertInto('OAuthAPIRefreshToken')
    .values({grantId, tokenHash, expiresAt: sql<Date>`now() + interval '30 days'`})
    .execute()
  return refreshToken
}

export default insertOAuthRefreshToken
