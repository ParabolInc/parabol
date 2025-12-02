import generateRandomString from '../../../generateRandomString'

export default function generateOAuthCredentials() {
  const clientId = `prbl-cid-${generateRandomString(32)}`
  const clientSecret = `prbl-s-${generateRandomString(64)}`

  return {
    clientId,
    clientSecret
  }
}
