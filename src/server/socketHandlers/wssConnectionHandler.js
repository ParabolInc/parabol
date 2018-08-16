import keepAlive from 'server/socketHelpers/keepAlive'
import handleDisconnect from 'server/socketHandlers/handleDisconnect'
import handleMessage from 'server/socketHandlers/handleMessage'
import url from 'url'
import {clientSecret as auth0ClientSecret} from 'server/utils/auth0Helpers'
import {verify} from 'jsonwebtoken'
import {CONNECTION_ERROR, WS_KEEP_ALIVE} from 'universal/utils/constants'
import handleConnect from 'server/socketHandlers/handleConnect'
import ConnectionContext from 'server/socketHelpers/ConnectionContext'
import sendRaw from 'server/socketHelpers/sendRaw'
import packageJSON from '../../../package.json'

const TREBUCHET_WS = 'trebuchet-ws'
const APP_VERSION = packageJSON.version
export default function connectionHandler (sharedDataLoader, rateLimiter) {
  return async function socketConnectionHandler (socket) {
    const req = socket.upgradeReq
    const {headers} = req
    const protocol = headers['sec-websocket-protocol']
    if (protocol !== TREBUCHET_WS) {
      sendRaw(socket, JSON.stringify({type: CONNECTION_ERROR, error: 'Invalid protocol'}))
      return
    }
    const {query} = url.parse(req.url, true)
    let authToken
    try {
      authToken = verify(query.token, Buffer.from(auth0ClientSecret, 'base64'))
    } catch (e) {
      sendRaw(socket, JSON.stringify({type: CONNECTION_ERROR, error: 'Invalid auth token'}))
      socket.close()
      return
    }
    const connectionContext = new ConnectionContext(
      socket,
      authToken,
      sharedDataLoader,
      rateLimiter
    )
    socket.send(JSON.stringify({version: APP_VERSION}))
    handleConnect(connectionContext)
    keepAlive(connectionContext, WS_KEEP_ALIVE)
    socket.on('message', handleMessage(connectionContext))
    socket.on('close', handleDisconnect(connectionContext))
  }
}
