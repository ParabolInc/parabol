import {WebSocketBehavior} from 'uWebSockets.js'
import {TrebuchetCloseReason} from '../../client/types/constEnums'
import safetyPatchRes from '../safetyPatchRes'
import {isAuthenticated} from '../utils/authorization'
import checkBlacklistJWT from '../utils/checkBlacklistJWT'
import getQueryToken from '../utils/getQueryToken'
import sendToSentry from '../utils/sendToSentry'
import uwsGetIP from '../utils/uwsGetIP'

const handleUpgrade: WebSocketBehavior<void>['upgrade'] = async (res, req, context) => {
  safetyPatchRes(res)
  const protocol = req.getHeader('sec-websocket-protocol')
  if (protocol !== 'trebuchet-ws') {
    sendToSentry(new Error(`WebSocket error: invalid protocol: ${protocol}`))
    // WS Error 1002 is roughly HTTP 412 Precondition Failed because we can't support the req header
    res.writeStatus('412').end()
    return
  }
  const authToken = getQueryToken(req)
  if (!isAuthenticated(authToken)) {
    res.writeStatus('401').end()
    return
  }

  const key = req.getHeader('sec-websocket-key')
  const extensions = req.getHeader('sec-websocket-extensions')
  const ip = uwsGetIP(res, req)
  const {sub: userId, iat} = authToken
  // ALL async calls must come after the message listener, or we'll skip out on messages (e.g. resub after server restart)
  const isBlacklistedJWT = await checkBlacklistJWT(userId, iat)
  if (isBlacklistedJWT) {
    res.writeStatus('401').end(TrebuchetCloseReason.EXPIRED_SESSION)
    return
  }
  res.upgrade({ip, authToken}, key, protocol, extensions, context)
}

export default handleUpgrade
