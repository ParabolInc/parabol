import {PAT_PREFIX} from '../graphql/public/applyScopeDirective'
import {getAuthTokenFromCookie} from './authCookie'
import getVerifiedAuthToken from './getVerifiedAuthToken'

interface RequestHeaders {
  cookie?: string | null
  authorization?: string | null
  applicationAuthorization?: string | null
}

export type RequestCredential = {kind: 'oauth' | 'pat' | 'session'; token: string} | {kind: 'none'}

export const getBearerToken = (header: string | null | undefined) =>
  header && /^bearer /i.test(header) ? header.slice(7) : undefined

const getRequestCredential = ({
  cookie,
  authorization,
  applicationAuthorization
}: RequestHeaders): RequestCredential => {
  // mattermost plugin cannot use the `authorization` header directly
  const bearerTokens = [
    getBearerToken(applicationAuthorization),
    getBearerToken(authorization)
  ].filter((token): token is string => !!token)
  for (const token of bearerTokens) {
    if (token.startsWith(PAT_PREFIX)) return {kind: 'pat', token}
    if (getVerifiedAuthToken(token, false, 'action-oauth2', true)) return {kind: 'oauth', token}
  }
  const sessionToken = getAuthTokenFromCookie(cookie ?? null) || bearerTokens[0]
  return sessionToken ? {kind: 'session', token: sessionToken} : {kind: 'none'}
}

export default getRequestCredential
