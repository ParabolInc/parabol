import keepAlive from 'server/socketHelpers/keepAlive'
import handleDisconnect from 'server/socketHandlers/handleDisconnect'
import handleMessage from 'server/socketHandlers/handleMessage'
import url from 'url'
import {clientSecret as auth0ClientSecret} from 'server/utils/auth0Helpers'
import {verify} from 'jsonwebtoken'
import {WS_KEEP_ALIVE} from 'universal/utils/constants'
import handleConnect from 'server/socketHandlers/handleConnect'
import ConnectionContext from 'server/socketHelpers/ConnectionContext'
import {TREBUCHET_WS} from '@mattkrick/trebuchet-client'

const APP_VERSION = process.env.npm_package_version
export default function connectionHandler (sharedDataLoader, rateLimiter) {
  return async function socketConnectionHandler (socket, req) {
    const {headers} = req
    const protocol = headers['sec-websocket-protocol']
    if (protocol !== TREBUCHET_WS) {
      // protocol error
      socket.close(1002)
      return
    }

    const {query} = url.parse(req.url, true)
    let authToken
    try {
      authToken = verify(query.token, Buffer.from(auth0ClientSecret, 'base64'))
    } catch (e) {
      // internal error (bad auth)
      socket.close(1011)
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
