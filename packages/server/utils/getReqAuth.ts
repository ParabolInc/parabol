import {HttpRequest} from 'uWebSockets.js'
import getVerifiedAuthToken from './getVerifiedAuthToken'

const getReqAuth = (req: HttpRequest) => {
  const authHeader = req.getHeader('authorization')
  const token = authHeader.slice(7)
  return getVerifiedAuthToken(token)
}

export default getReqAuth
