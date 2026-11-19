import {randomBytes} from 'crypto'
import generateRandomString from '../generateRandomString'
import hashRandomToken from '../utils/hashRandomToken'

const REFRESH_TOKEN = /^prt_[A-Za-z0-9_-]{43}$/

export function generateOAuthClientId() {
  return 'prbl-cid-' + generateRandomString(16)
}

export function generateOAuthClientSecret() {
  return 'prbl-s-' + generateRandomString(32)
}

export function isOAuthRefreshToken(refreshToken: string) {
  return REFRESH_TOKEN.test(refreshToken)
}

export function generateOAuthRefreshToken() {
  const refreshToken = `prt_${randomBytes(32).toString('base64url')}`
  return {refreshToken, tokenHash: hashRandomToken(refreshToken)}
}
