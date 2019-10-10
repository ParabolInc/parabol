import url from 'url'
import {verify} from 'jsonwebtoken'
import {clientSecret as auth0ClientSecret} from '../utils/auth0Helpers'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import handleConnect from '../socketHandlers/handleConnect'
import handleDisconnect from '../socketHandlers/handleDisconnect'
import keepAlive from '../socketHelpers/keepAlive'

const APP_VERSION = process.env.npm_package_version
const SSEConnectionHandler = (sharedDataLoader, rateLimiter, sseClients) => (req, res) => {
  const {query} = url.parse(req.url, true)
  let authToken
  try {
    authToken = verify(query.token as string, Buffer.from(auth0ClientSecret, 'base64'))
  } catch (e) {
    res.sendStatus(404)
    return
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    // turn off nginx buffering: https://www.nginx.com/resources/wiki/start/topics/examples/x-accel/#x-accel-buffering
    'X-Accel-Buffering': 'no'
  })
  res.socket.setNoDelay() // disable Nagle algorithm
  const connectionContext = new ConnectionContext(
    res,
    authToken,
    sharedDataLoader,
    rateLimiter,
    req.ip
  )
  sseClients[connectionContext.id] = connectionContext
  res.write(`event: id\n`)
  res.write(`retry: 1000\n`)
  res.write(`data: ${connectionContext.id}\n\n`)
  res.write(`data: ${JSON.stringify({version: APP_VERSION})}\n\n`)
  res.flush()
  handleConnect(connectionContext)
  keepAlive(connectionContext)
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
