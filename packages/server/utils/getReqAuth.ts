import type {HttpRequest} from 'uWebSockets.js'
import getRequestCredential from './getRequestCredential'
import getVerifiedAuthToken from './getVerifiedAuthToken'

const getReqAuth = (req: HttpRequest, logErrors = true) => {
  const credential = getRequestCredential({
    cookie: req.getHeader('cookie'),
    authorization: req.getHeader('authorization'),
    applicationAuthorization: req.getHeader('x-application-authorization')
  })
  if (credential.kind !== 'session') return null
  return getVerifiedAuthToken(credential.token, logErrors)
}

export default getReqAuth
