import {type Kysely, sql} from 'kysely'
import type {DB} from '../postgres/types/pg'
import {generateOAuthRefreshToken} from './credentials'

const insertOAuthRefreshToken = async (
  db: Kysely<DB>,
  grantId: number,
  parentId: number | null
) => {
  const {refreshToken, tokenHash} = generateOAuthRefreshToken()
  await db
    .insertInto('OAuthAPIRefreshToken')
    .values({grantId, parentId, tokenHash, expiresAt: sql<Date>`now() + interval '30 days'`})
    .execute()
  return refreshToken
}

export default insertOAuthRefreshToken
