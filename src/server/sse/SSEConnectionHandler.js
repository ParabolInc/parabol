import url from 'url'
import {WS_KEEP_ALIVE} from 'universal/utils/constants'
import {verify} from 'jsonwebtoken'
import {clientSecret as auth0ClientSecret} from 'server/utils/auth0Helpers'
import ConnectionContext from 'server/socketHelpers/ConnectionContext'
import handleConnect from 'server/socketHandlers/handleConnect'
import handleDisconnect from 'server/socketHandlers/handleDisconnect'
import packageJSON from '../../../package.json'
import keepAlive from 'server/socketHelpers/keepAlive'

const APP_VERSION = packageJSON.version
const SSEConnectionHandler = (sharedDataLoader, rateLimiter, sseClients) => (req, res) => {
  const {query} = url.parse(req.url, true)
  let authToken
  try {
    authToken = verify(query.token, Buffer.from(auth0ClientSecret, 'base64'))
  } catch (e) {
    res.sendStatus(404)
    return
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  })
  res.socket.setNoDelay() // disable Nagle algorithm
  const connectionContext = new ConnectionContext(res, authToken, sharedDataLoader, rateLimiter)
  sseClients[connectionContext.id] = connectionContext
  res.write(`event: id\n`)
  res.write(`retry: 100\n`)
  res.write(`data: ${connectionContext.id}\n\n`)
  res.write(`event: version\n`)
  res.write(`data: ${APP_VERSION}\n\n`)

  handleConnect(connectionContext)
  keepAlive(connectionContext, WS_KEEP_ALIVE)
  res.on('close', () => {
    handleDisconnect(connectionContext)
    delete sseClients[connectionContext.id]
  })
  res.on('finish', () => {
    handleDisconnect(connectionContext)
    delete sseClients[connectionContext.id]
  })
}

export default SSEConnectionHandler
