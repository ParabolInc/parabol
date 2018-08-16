import url from 'url'
import {WS_KEEP_ALIVE} from 'universal/utils/constants'
import {verify} from 'jsonwebtoken'
import {clientSecret as auth0ClientSecret} from 'server/utils/auth0Helpers'
import ConnectionContext from 'server/socketHelpers/ConnectionContext'
import handleConnect from 'server/socketHandlers/handleConnect'
import handleDisconnect from 'server/socketHandlers/handleDisconnect'
import closeTransport from 'server/socketHelpers/closeTransport'
import packageJSON from '../../../package.json'

const APP_VERSION = packageJSON.version
const SSEConnectionHandler = (sharedDataLoader, rateLimiter, sseClients) => (req, res) => {
  // TODO rate limit this?
  const {query} = url.parse(req.url, true)
  if (query.ping) {
    setTimeout(() => {
      res.sendStatus(200)
    }, WS_KEEP_ALIVE)
    return
  }

  console.log('setting up sse')
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  })
  res.socket.setNoDelay() // disable Nagle algorithm

  let authToken
  try {
    authToken = verify(query.token, Buffer.from(auth0ClientSecret, 'base64'))
  } catch (e) {
    res.write(`event: connectionError\n`)
    res.write('data: Invalid auth token\n\n')
    closeTransport(res)
    return
  }

  const connectionContext = new ConnectionContext(res, authToken, sharedDataLoader, rateLimiter)
  sseClients[connectionContext.id] = connectionContext
  res.write(`event: id\n`)
  res.write(`data: ${connectionContext.id}\n\n`)
  res.write(`event: version\n`)
  res.write(`data: ${APP_VERSION}\n\n`)

  handleConnect(connectionContext)
  // keepAlive(connectionContext, WS_KEEP_ALIVE)
  req.on('close', () => {
    handleDisconnect(connectionContext)
    delete sseClients[connectionContext.id]
    console.log('TODO client close', req.url)
  })
}

export default SSEConnectionHandler
