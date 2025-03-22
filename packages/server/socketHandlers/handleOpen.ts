import {WebSocketBehavior} from 'uWebSockets.js'
import {TrebuchetCloseReason} from '../../client/types/constEnums'
import activeClients from '../activeClients'
import AuthToken from '../database/types/AuthToken'
import {wsConnections, wsErrors} from '../metrics/metricsHandler'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import keepAlive from '../socketHelpers/keepAlive'
import {sendEncodedMessage} from '../socketHelpers/sendEncodedMessage'
import {isAuthenticated} from '../utils/authorization'
import checkBlacklistJWT from '../utils/checkBlacklistJWT'
import {Logger} from '../utils/Logger'
import sendToSentry from '../utils/sendToSentry'
import handleConnect from './handleConnect'

// Get the port from environment variables
const PORT = Number(__PRODUCTION__ ? process.env.PORT : process.env.SOCKET_PORT)

export interface SocketUserData {
  connectionContext: ConnectionContext
  authToken: AuthToken
  ip: string
  protocol: string
  done: boolean
  startTime: number
}

const handleOpen: WebSocketBehavior<SocketUserData>['open'] = async (ws) => {
  const userData = ws.getUserData()
  const {authToken, ip, protocol} = userData

  if (protocol !== 'trebuchet-ws') {
    sendToSentry(new Error(`WebSocket error: invalid protocol: ${protocol}`))
    ws.end(1002, 'Invalid protocol')
    return
  }

  if (!isAuthenticated(authToken)) {
    ws.end(1008, TrebuchetCloseReason.EXPIRED_SESSION)
    return
  }

  // add the connectionContext before an async call to make sure it's available in handleMessage
  const connectionContext = (userData.connectionContext = new ConnectionContext(ws, authToken, ip))
  activeClients.set(connectionContext)

  try {
    // ALL async calls must come after the message listener, or we'll skip out on messages (e.g. resub after server restart)
    const {sub: userId, iat} = authToken
    const isBlacklistedJWT = await checkBlacklistJWT(userId, iat)
    if (isBlacklistedJWT) {
      ws.end(1008, TrebuchetCloseReason.EXPIRED_SESSION)
      return
    }

    const nextAuthToken = await handleConnect(connectionContext)
    if (userData.done) return
    sendEncodedMessage(connectionContext, {version: __APP_VERSION__, authToken: nextAuthToken})
    keepAlive(connectionContext)

    // Track connection metrics
    if (process.env.ENABLE_METRICS === 'true') {
      wsConnections.inc({port: PORT.toString()})
      userData.startTime = Date.now()
    }
  } catch (error) {
    Logger.error('Error in handleOpen:', error)
    if (process.env.ENABLE_METRICS === 'true') {
      wsErrors.inc({type: 'open_error', port: PORT.toString()})
    }
    if (error instanceof Error) {
      sendToSentry(error)
    }
    ws.end(1008, TrebuchetCloseReason.SESSION_INVALIDATED)
  }
}

export default handleOpen
