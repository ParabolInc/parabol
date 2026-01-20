import AuthToken from '../database/types/AuthToken'
import generateRandomString from '../generateRandomString'
import encodeAuthToken from '../utils/encodeAuthToken'

export function generateBearerToken(scimId: string) {
  const scopes = ['scim']
  const authToken = new AuthToken({
    sub: scimId,
    tms: [],
    scope: scopes,
    aud: 'action-scim'
  })
  const accessToken = encodeAuthToken(authToken)
  return accessToken
}

export function censorBearerToken(token: string | null) {
  if (!token) return null
  return token.substring(0, 15) + '••••••••'
}

export function generateOAuthClientId() {
  return 'prbl-scim-cid-' + generateRandomString(16)
}

export function generateOAuthClientSecret() {
  return 'prbl-s-' + generateRandomString(32)
}

export function censorOAuthClientSecret(secret: string | null) {
  if (!secret) return null
  return secret.substring(0, 12) + '••••••••'
}
