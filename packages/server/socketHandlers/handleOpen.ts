import {TrebuchetCloseReason} from 'parabol-client/types/constEnums'
import {HttpRequest, WebSocket} from 'uWebSockets.js'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import keepAlive from '../socketHelpers/keepAlive'
import sendEncodedMessage from '../socketHelpers/sendEncodedMessage'
import {isAuthenticated} from '../utils/authorization'
import checkBlacklistJWT from '../utils/checkBlacklistJWT'
import getQueryToken from '../utils/getQueryToken'
import sendToSentry from '../utils/sendToSentry'
import uwsGetIP from '../utils/uwsGetIP'
import handleConnect from './handleConnect'

const APP_VERSION = process.env.npm_package_version

const authorize = async (connectionContext: ConnectionContext<WebSocket>) => {
  const {authToken, socket} = connectionContext
  const {sub: userId, iat} = authToken
  // ALL async calls must come after the message listener, or we'll skip out on messages (e.g. resub after server restart)
  const isBlacklistedJWT = await checkBlacklistJWT(userId, iat)
  if (isBlacklistedJWT) {
    if (!socket.done) {
      socket.end(1011, TrebuchetCloseReason.EXPIRED_SESSION)
    }
    return
  }
  const nextAuthToken = await handleConnect(connectionContext)
  sendEncodedMessage(socket, {version: APP_VERSION, authToken: nextAuthToken})
  keepAlive(connectionContext)
}

const handleOpen = (socket: WebSocket, req: HttpRequest) => {
  try {
    const protocol = req.getHeader('sec-websocket-protocol')
    if (protocol !== 'trebuchet-ws') {
      // protocol error
      sendToSentry(new Error(`WebSocket error: invalid protocol: ${protocol}`))
      socket.end(1002)
      return
    }

    const authToken = getQueryToken(req)
    if (!isAuthenticated(authToken)) {
      const clientIp = req.getHeader('x-forwarded-for')
      const badAuthToken = getQueryToken(req, true)
      const {sub, exp} = badAuthToken
      // internal error (bad auth)
      sendToSentry(new Error(`WebSocket error: not authenticated`), {
        userId: sub,
        ip: clientIp,
        tags: {exp: new Date(exp * 1000).toJSON()},
        sampleRate: 0.01
      })
      socket.end(1011)
      return
    }
    const ip = uwsGetIP(socket, req)
    socket.connectionContext = new ConnectionContext(socket, authToken, ip)
    // keep async stuff separate so the message handler gets set up fast
    authorize(socket.connectionContext).catch()
  } catch (e) {
    sendToSentry(e)
  }
}

export default handleOpen
