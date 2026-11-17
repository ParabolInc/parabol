import {createHash, randomBytes} from 'crypto'
import {sql} from 'kysely'
import generateRandomString from '../generateRandomString'
import {CipherId} from '../utils/CipherId'

const REFRESH_TOKEN = /^prt_(\d{1,10})_([A-Za-z0-9_-]{43})$/

export const oauthRefreshTokenExpiresAt = sql<Date>`now() + interval '30 days'`

export function generateOAuthClientId() {
  return 'prbl-cid-' + generateRandomString(16)
}

export function generateOAuthClientSecret() {
  return 'prbl-s-' + generateRandomString(32)
}

export function hashOAuthRefreshSecret(secret: string) {
  return createHash('sha256').update(secret).digest('hex')
}

export function generateOAuthRefreshSecret() {
  const secret = randomBytes(32).toString('base64url')
  return {secret, secretHash: hashOAuthRefreshSecret(secret)}
}

export function formatOAuthRefreshToken(grantId: number, secret: string) {
  return `prt_${CipherId.encrypt(grantId)}_${secret}`
}

export function parseOAuthRefreshToken(refreshToken: string) {
  const match = REFRESH_TOKEN.exec(refreshToken)
  if (!match) return null
  const grantId = CipherId.decrypt(Number(match[1]))
  if (grantId < 0) return null
  return {grantId, secret: match[2]!}
}
