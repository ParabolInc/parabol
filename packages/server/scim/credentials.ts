import generateRandomString from '../generateRandomString'

export function generateBearerToken() {
  return 'prbl-scim-' + generateRandomString(32)
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
