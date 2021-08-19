import {HttpRequest} from 'uWebSockets.js'
import getVerifiedAuthToken from './getVerifiedAuthToken'

const getReqAuth = (req: HttpRequest) => {
  const hasReverseProxy = req.getHeader('x-forwarded-for')
  const authorizationHeaderName = hasReverseProxy ? 'authorization' : 'x-application-authorization'
  const authHeader = req.getHeader(authorizationHeaderName)
  const token = authHeader.slice(7)
  return getVerifiedAuthToken(token)
}

export default getReqAuth
