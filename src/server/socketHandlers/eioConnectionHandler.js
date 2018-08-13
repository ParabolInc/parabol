import keepAlive from 'server/socketHelpers/keepAlive'
import handleDisconnect from 'server/socketHandlers/handleDisconnect'
import handleMessage from 'server/socketHandlers/handleMessage'
import sendMessage from 'server/socketHelpers/sendMessage'
import url from 'url'
import {clientSecret as auth0ClientSecret} from 'server/utils/auth0Helpers'
import {verify} from 'jsonwebtoken'
import {GQL_CONNECTION_ERROR, WS_KEEP_ALIVE} from 'universal/utils/constants'
import handleConnect from 'server/socketHandlers/handleConnect'

class ConnectionContext {
  constructor (socket, authToken, sharedDataLoader, rateLimiter) {
    this.authToken = authToken
    this.availableResubs = []
    this.cancelKeepAlive = null
    this.id = socket.id
    this.isAlive = true
    this.rateLimiter = rateLimiter
    this.socket = socket
    this.sharedDataLoader = sharedDataLoader
    this.subs = {}
  }
}

export default function connectionHandler (sharedDataLoader, rateLimiter) {
  return async function socketConnectionHandler (socket) {
    const req = socket.request
    // we don't need websockets, we're we're going...
    //
    // const {headers} = req
    // const protocol = headers['sec-websocket-protocol']
    // if (protocol !== GRAPHQL_WS) {
    //   sendMessage(socket, GQL_CONNECTION_ERROR, {
    //     errors: [{message: 'Invalid protocol'}]
    //   })
    //   return
    // }
    const {query} = url.parse(req.url, true)
    let authToken
    try {
      authToken = verify(query.token, Buffer.from(auth0ClientSecret, 'base64'))
    } catch (e) {
      sendMessage(socket, GQL_CONNECTION_ERROR, {
        errors: [{message: 'Invalid auth token'}]
      })
      socket.close()
      return
    }
    const connectionContext = new ConnectionContext(
      socket,
      authToken,
      sharedDataLoader,
      rateLimiter
    )
    handleConnect(connectionContext)
    keepAlive(connectionContext, WS_KEEP_ALIVE)
    socket.on('message', handleMessage(connectionContext))
    socket.on('close', handleDisconnect(connectionContext))
  }
}
