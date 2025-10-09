import type {HttpRequest} from 'uWebSockets.js'
import {CookieStore} from '@whatwg-node/cookie-store'
import getVerifiedAuthToken from './getVerifiedAuthToken'

const getReqAuth = async (req: HttpRequest) => {
  // mattermost plugin cannot use the `authorization` header directly
  const authHeader = req.getHeader('x-application-authorization') || req.getHeader('authorization')
  const headerToken = authHeader.slice(7)

  const cookieStore = new CookieStore(req.getHeader('cookie') || '')
  const cookieToken = (await cookieStore.get('__Host-Http-authToken'))?.value

  const token = cookieToken || headerToken

  return getVerifiedAuthToken(token)
}

export default getReqAuth
