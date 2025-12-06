import {generateOAuthClientId, generateOAuthClientSecret} from '../../../oauth/credentials'

export default function generateOAuthCredentials() {
  return {
    clientId: generateOAuthClientId(),
    clientSecret: generateOAuthClientSecret()
  }
}
