import {generateOAuthClientId, generateOAuthClientSecret} from '../../../oauth2/credentials'

export default function generateOAuthCredentials() {
  return {
    clientId: generateOAuthClientId(),
    clientSecret: generateOAuthClientSecret()
  }
}
