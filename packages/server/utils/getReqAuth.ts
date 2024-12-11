import {HttpRequest} from 'uWebSockets.js'
import getVerifiedAuthToken from './getVerifiedAuthToken'

const getReqAuth = (req: HttpRequest) => {
  // To lock down dev/staging servers, our reverse proxy requires basic auth via the "authorization" header
  // For our app auth, we use "x-application-authorization"
  // Our cloud offering has an nginx config that copies x-applicaitn-authorization to the authorization header
  // However, local & private deployments may not do that
  const authHeader = req.getHeader('x-application-authorization') || req.getHeader('authorization')
  console.log('GEORG authHeader', authHeader)
  const token = authHeader.slice(7)
  return getVerifiedAuthToken(token)
}

export default getReqAuth
