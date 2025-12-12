import generateRandomString from '../generateRandomString'

export function generateOAuthClientId() {
  return 'prbl-cid-' + generateRandomString(16)
}

export function generateOAuthClientSecret() {
  return 'prbl-s-' + generateRandomString(32)
}
