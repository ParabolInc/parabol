import {HttpRequest} from 'uWebSockets.js'
import getVerifiedAuthToken from './getVerifiedAuthToken'

const getReqAuth = (req: HttpRequest) => {
  // mattermost plugin cannot use the `authorization` header directly
  const authHeader = req.getHeader('x-application-authorization') || req.getHeader('authorization')
  const token = authHeader.slice(7)
  return getVerifiedAuthToken(token)
}

export default getReqAuth
