import {WebSocketBehavior} from 'uWebSockets.js'
import getQueryToken from '../utils/getQueryToken'
import uwsGetIP from '../utils/uwsGetIP'

const handleUpgrade: WebSocketBehavior<void>['upgrade'] = (res, req, context) => {
  const key = req.getHeader('sec-websocket-key')
  const protocol = req.getHeader('sec-websocket-protocol')
  const extensions = req.getHeader('sec-websocket-extensions')
  const ip = uwsGetIP(res, req)
  const authToken = getQueryToken(req)
  res.upgrade({ip, authToken, protocol}, key, protocol, extensions, context)
}

export default handleUpgrade
