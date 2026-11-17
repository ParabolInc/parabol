import type {HttpRequest} from 'uWebSockets.js'
import {PAT_PREFIX} from '../graphql/public/applyScopeDirective'
import {getAuthTokenFromCookie} from './authCookie'
import getVerifiedAuthToken from './getVerifiedAuthToken'

const getReqAuth = (req: HttpRequest, logErrors = true) => {
  // mattermost plugin cannot use the `authorization` header directly
  const applicationAuthHeader = req.getHeader('x-application-authorization')
  const authHeader = applicationAuthHeader || req.getHeader('authorization')
  const headerToken = authHeader.slice(7)
  if (headerToken?.startsWith(PAT_PREFIX)) return null
  const isOAuthBearer = [applicationAuthHeader, req.getHeader('authorization')].some(
    (header) =>
      header.startsWith('Bearer ') &&
      !!getVerifiedAuthToken(header.slice(7), false, 'action-oauth2')
  )
  if (isOAuthBearer) return null
  const cookieToken = getAuthTokenFromCookie(req.getHeader('cookie'))

  const token = cookieToken || headerToken

  return getVerifiedAuthToken(token, logErrors)
}

export default getReqAuth
