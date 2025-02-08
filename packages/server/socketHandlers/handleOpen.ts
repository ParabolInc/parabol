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
    socket.end(1002, 'Invalid protocol')
    return
  }

  if (!isAuthenticated(authToken)) {
    socket.end(1008, TrebuchetCloseReason.EXPIRED_SESSION)
    return
  }

  // add the connectionContext before an async call to make sure it's available in handleMessage
  const connectionContext = (socket.getUserData().connectionContext = new ConnectionContext(
    socket,
    authToken,
    ip
  ))

  activeClients.set(connectionContext)

  // ALL async calls must come after the message listener, or we'll skip out on messages (e.g. resub after server restart)
  const {sub: userId, iat} = authToken
  const isBlacklistedJWT = await checkBlacklistJWT(userId, iat)
  if (isBlacklistedJWT) {
    socket.end(1008, TrebuchetCloseReason.EXPIRED_SESSION)
    return
  }

  // messages will start coming in before handleConnect completes & sit in the readyQueue
  const nextAuthToken = await handleConnect(connectionContext)
  console.log('sendEncoded message for version', connectionContext.id)
  sendEncodedMessage(connectionContext, {version: __APP_VERSION__, authToken: nextAuthToken})
  keepAlive(connectionContext)
}

export default handleOpen
