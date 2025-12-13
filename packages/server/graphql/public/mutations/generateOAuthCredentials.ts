import {sign} from 'jsonwebtoken'
import {generateOAuthClientId, generateOAuthClientSecret} from '../../../oauth2/credentials'
import type {MutationResolvers} from '../resolverTypes'

const generateOAuthCredentials: MutationResolvers['generateOAuthCredentials'] = async () => {
  const clientId = generateOAuthClientId()
  const clientSecret = generateOAuthClientSecret()

  const credentialToken = sign(
    {clientId, clientSecret},
    Buffer.from(process.env.SERVER_SECRET!, 'base64'),
    {expiresIn: '1h'}
  )

  return {
    clientId,
    clientSecret,
    credentialToken
  }
}

export default generateOAuthCredentials
