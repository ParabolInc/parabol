import {generateOAuthClientId, generateOAuthClientSecret} from '../../../oauth2/credentials'
import type {MutationResolvers} from '../resolverTypes'

const generateOAuthCredentials: MutationResolvers['generateOAuthCredentials'] = async () => {
  return {
    clientId: generateOAuthClientId(),
    clientSecret: generateOAuthClientSecret()
  }
}

export default generateOAuthCredentials
