import {type Kysely, sql} from 'kysely'
import type {DB} from '../postgres/types/pg'
import {generateOAuthRefreshToken} from './credentials'

const insertOAuthRefreshToken = async (db: Kysely<DB>, grantId: number) => {
  const {refreshToken, tokenHash} = generateOAuthRefreshToken()
  await db
    .deleteFrom('OAuthAPIRefreshToken')
    .where('grantId', '=', grantId)
    .where('expiresAt', '<', sql<Date>`now()`)
    .execute()
  await db
    .insertInto('OAuthAPIRefreshToken')
    .values({grantId, tokenHash, expiresAt: sql<Date>`now() + interval '30 days'`})
    .execute()
  return refreshToken
}

export default insertOAuthRefreshToken
