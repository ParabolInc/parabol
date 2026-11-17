import ms from 'ms'
import AuthToken from '../database/types/AuthToken'
import {CipherId} from '../utils/CipherId'
import encodeAuthToken from '../utils/encodeAuthToken'

const ACCESS_TOKEN_LIFESPAN = ms('1h')

interface Input {
  grantId: number
  userId: string
  scopes: string[]
  clientId: string
  resource: string | undefined
  refreshToken: string
}

const issueOAuthTokens = (input: Input): Record<string, string | number> => {
  const {grantId, userId, scopes, clientId, resource, refreshToken} = input
  const authToken = new AuthToken({
    sub: userId,
    tms: [],
    scope: scopes,
    lifespan_ms: ACCESS_TOKEN_LIFESPAN,
    aud: 'action-oauth2',
    client_id: clientId,
    grant_id: CipherId.encrypt(grantId),
    resource
  })
  return {
    access_token: encodeAuthToken(authToken),
    token_type: 'Bearer',
    expires_in: ACCESS_TOKEN_LIFESPAN / 1000,
    refresh_token: refreshToken,
    scope: scopes.join(' ')
  }
}

export default issueOAuthTokens
