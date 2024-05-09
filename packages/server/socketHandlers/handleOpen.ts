import {WebSocketBehavior} from 'uWebSockets.js'
import {TrebuchetCloseReason} from '../../client/types/constEnums'
import activeClients from '../activeClients'
import AuthToken from '../database/types/AuthToken'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import keepAlive from '../socketHelpers/keepAlive'
import {sendEncodedMessage} from '../socketHelpers/sendEncodedMessage'
import {isAuthenticated} from '../utils/authorization'
import checkBlacklistJWT from '../utils/checkBlacklistJWT'
import sendToSentry from '../utils/sendToSentry'
import handleConnect from './handleConnect'

const APP_VERSION = process.env.npm_package_version
export type SocketUserData = {
  connectionContext: ConnectionContext
  authToken: AuthToken
  ip: string
  protocol: string
  done?: true
}

const handleOpen: WebSocketBehavior<SocketUserData>['open'] = async (socket) => {
  const {authToken, ip, protocol} = socket.getUserData()
  if (protocol !== 'trebuchet-ws') {
    sendToSentry(new Error(`WebSocket error: invalid protocol: ${protocol}`))
    // WS Error 1002 is roughly HTTP 412 Precondition Failed because we can't support the req header
    socket.end(412, 'Invalid protocol')
    return
  }

  if (!isAuthenticated(authToken)) {
    socket.end(401, TrebuchetCloseReason.EXPIRED_SESSION)
    return
  }

  // ALL async calls must come after the message listener, or we'll skip out on messages (e.g. resub after server restart)
  const {sub: userId, iat} = authToken
  const isBlacklistedJWT = await checkBlacklistJWT(userId, iat)
  if (isBlacklistedJWT) {
    socket.end(401, TrebuchetCloseReason.EXPIRED_SESSION)
    return
  }

  const connectionContext = (socket.getUserData().connectionContext = new ConnectionContext(
    socket,
    authToken,
    ip
  ))
  activeClients.set(connectionContext)
  // messages will start coming in before handleConnect completes & sit in the readyQueue
  const nextAuthToken = await handleConnect(connectionContext)
  sendEncodedMessage(connectionContext, {version: APP_VERSION, authToken: nextAuthToken})
  keepAlive(connectionContext)
}

export default handleOpen
