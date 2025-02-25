import {TrebuchetCloseReason} from 'parabol-client/types/constEnums'
import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import activeClients from '../activeClients'
import uWSAsyncHandler from '../graphql/uWSAsyncHandler'
import handleConnect from '../socketHandlers/handleConnect'
import handleDisconnect from '../socketHandlers/handleDisconnect'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import closeTransport from '../socketHelpers/closeTransport'
import keepAlive from '../socketHelpers/keepAlive'
import {sendEncodedMessage} from '../socketHelpers/sendEncodedMessage'
import {isAuthenticated} from '../utils/authorization'
import checkBlacklistJWT from '../utils/checkBlacklistJWT'
import getQueryToken from '../utils/getQueryToken'
import uwsGetIP from '../utils/uwsGetIP'
import sendSSEMessage from './sendSSEMessage'

const SSEConnectionHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const authToken = getQueryToken(req)
  const connectionContext = new ConnectionContext(res, authToken, uwsGetIP(res, req))
  res.onAborted(() => {
    handleDisconnect(connectionContext)
  })
  if (!isAuthenticated(authToken)) {
    res.writeStatus('401').end()
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
    closeTransport(connectionContext, 401, TrebuchetCloseReason.EXPIRED_SESSION)
    return
  }

  activeClients.set(connectionContext)
  const nextAuthToken = await handleConnect(connectionContext)
  if (res.done) return
  res.tryEnd(`retry: 1000\n`, 1e8)
  sendSSEMessage(res, connectionContext.id, 'id')
  sendEncodedMessage(connectionContext, {version: __APP_VERSION__, authToken: nextAuthToken})
  keepAlive(connectionContext)
}, true)

export default SSEConnectionHandler
