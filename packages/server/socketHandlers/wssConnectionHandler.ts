import {TrebuchetCloseReason} from 'parabol-client/types/constEnums'
import {HttpRequest, WebSocket} from 'uWebSockets.js'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import sendEncodedMessage from '../socketHelpers/sendEncodedMessage'
import {isAuthenticated} from '../utils/authorization'
import checkBlacklistJWT from '../utils/checkBlacklistJWT'
import getQueryToken from '../utils/getQueryToken'
import uwsGetIP from '../utils/uwsGetIP'
import handleConnect from './handleConnect'
import keepAlive from '../socketHelpers/keepAlive'
import sendToSentry from '../utils/sendToSentry'

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

const wssConnectionHandler = (socket: WebSocket, req: HttpRequest) => {
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
      // internal error (bad auth)
      sendToSentry(new Error(`WebSocket error: not authenticated`))
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

export default wssConnectionHandler
