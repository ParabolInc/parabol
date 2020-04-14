// Datadog APM, must be first import (disabled for now)
// import './tracer'
import path from 'path'
import uws, {SHARED_COMPRESSOR} from 'uWebSockets.js'
import './.dotenv' // has side effect, must be first!
import hotSwap from './hotSwap'
import './initSentry'
import makeLiveReloadable from './makeLiveReloadable'
import PROD from './PROD'
import {getWebpackDevMiddleware} from './serveFromWebpack'

process.on('uncaughtException', (err) => {
  console.log('FIXME UNCAUGHT EXCEPTION', err)
})

if (!PROD) {
  hotSwap([path.join(__dirname, '../src')])
  getWebpackDevMiddleware()
}

const PORT = Number(process.env.PORT)

const reloadable = makeLiveReloadable(__dirname, {
  ICSHandler: './ICSHandler',
  PWAHandler: './PWAHandler',
  listenHandler: './listenHandler',
  stripeWebhookHandler: './billing/stripeWebhookHandler',
  githubWebhookHandler: './integrations/githubWebhookHandler',
  SSEConnectionHandler: './sse/SSEConnectionHandler',
  SSEPingHandler: './sse/SSEPingHandler',
  staticFileHandler: './staticFileHandler',
  SAMLHandler: './utils/SAMLHandler',
  httpGraphQLHandler: './graphql/httpGraphQLHandler',
  intranetHttpGraphQLHandler: './graphql/intranetGraphQLHandler',
  createSSR: './createSSR',
  handleMessage: './socketHandlers/handleMessage',
  handleClose: './socketHandlers/handleClose',
  handleOpen: './socketHandlers/handleOpen'
})

uws
  .App()
  .get('/favicon.ico', reloadable.PWAHandler)
  .get('/sw.js', reloadable.PWAHandler)
  .get('/manifest.json', reloadable.PWAHandler)
  .get('/static/*', reloadable.staticFileHandler)
  .get('/email/createics', reloadable.ICSHandler)
  .get('/sse', reloadable.SSEConnectionHandler)
  .get('/sse-ping', reloadable.SSEPingHandler)
  .post('/stripe', reloadable.stripeWebhookHandler)
  .post('/webhooks/github', reloadable.githubWebhookHandler)
  .post('/graphql', reloadable.httpGraphQLHandler)
  .post('/intranet-graphql', reloadable.intranetHttpGraphQLHandler)
  .post('/saml/:domain', reloadable.SAMLHandler)
  .ws('/*', {
    compression: SHARED_COMPRESSOR,
    idleTimeout: 0,
    maxPayloadLength: 5 * 2 ** 20,
    open: reloadable.handleOpen,
    message: reloadable.handleMessage,
    // today, we don't send folks enough data to worry about backpressure
    close: reloadable.handleClose
  })
  .any('/*', reloadable.createSSR)
  .listen(PORT, reloadable.listenHandler)
