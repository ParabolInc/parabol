import {TrebuchetCloseReason} from 'parabol-client/types/constEnums'
import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import handleConnect from '../socketHandlers/handleConnect'
import handleDisconnect from '../socketHandlers/handleDisconnect'
import closeTransport from '../socketHelpers/closeTransport'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import keepAlive from '../socketHelpers/keepAlive'
import sendEncodedMessage from '../socketHelpers/sendEncodedMessage'
import sseClients from '../sseClients'
import {isAuthenticated} from '../utils/authorization'
import checkBlacklistJWT from '../utils/checkBlacklistJWT'
import getQueryToken from '../utils/getQueryToken'
import uwsGetIP from '../utils/uwsGetIP'
import sendSSEMessage from './sendSSEMessage'

const APP_VERSION = process.env.npm_package_version

const SSEConnectionHandler = async (res: HttpResponse, req: HttpRequest) => {
  res.onAborted(() => {
    console.log('sse abort')
    if (typeof connectionContext !== 'undefined') {
      handleDisconnect(connectionContext)
      sseClients.delete(connectionContext.id)
    }
  })
  const authToken = getQueryToken(req)
  if (!isAuthenticated(authToken)) {
    res.writeStatus('401 Unauthorized')
    res.end()
    return
  }
  res
    .writeHeader('content-type', 'text/event-stream')
    .writeHeader('cache-control', 'no-cache')
    .writeHeader('connection', 'keep-alive')
    // turn off nginx buffering: https://www.nginx.com/resources/wiki/start/topics/examples/x-accel/#x-accel-buffering
    .writeHeader('x-accel-buffering', 'no')

  const {sub: userId, iat} = authToken
  const isBlacklistedJWT = await checkBlacklistJWT(userId, iat)
  if (isBlacklistedJWT) {
    closeTransport(res, 401, TrebuchetCloseReason.EXPIRED_SESSION)
    return
  }
  const connectionContext = new ConnectionContext(res as any, authToken, uwsGetIP(res))
  sseClients.set(connectionContext)
  const nextAuthToken = await handleConnect(connectionContext)
  res.tryEnd(`retry: 1000\n`, 1e8)
  sendSSEMessage(res, connectionContext.id, 'id')
  sendEncodedMessage(res, {version: APP_VERSION, authToken: nextAuthToken})
  keepAlive(connectionContext)
}

export default SSEConnectionHandler
