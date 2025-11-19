import type {HttpRequest} from 'uWebSockets.js'
import {getAuthTokenFromCookie} from './authCookie'
import getVerifiedAuthToken from './getVerifiedAuthToken'

const getReqAuth = (req: HttpRequest) => {
  // mattermost plugin cannot use the `authorization` header directly
  const authHeader = req.getHeader('x-application-authorization') || req.getHeader('authorization')
  const headerToken = authHeader.slice(7)

  const cookieToken = getAuthTokenFromCookie(req.getHeader('cookie'))

  const token = cookieToken || headerToken

  return getVerifiedAuthToken(token)
}

export default getReqAuth
