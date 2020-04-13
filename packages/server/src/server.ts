// Datadog APM, must be first import (disabled for now)
// import './tracer'
import './utils/dotenv' // must be first!
import path from 'path'
import uws, {SHARED_COMPRESSOR} from 'uWebSockets.js'
import stripeWebhookHandler from './billing/stripeWebhookHandler'
import createSSR from './createSSR'
import httpGraphQLHandler from './graphql/httpGraphQLHandler'
import intranetHttpGraphQLHandler from './graphql/intranetGraphQLHandler'
import hotSwap from './hotSwap'
import ICSHandler from './ICSHandler'
import './initSentry'
import githubWebhookHandler from './integrations/githubWebhookHandler'
import listenHandler from './listenHandler'
import makeRefs from './makeRefs'
import PROD from './PROD'
import PWAHandler from './PWAHandler'
import {getWebpackDevMiddleware} from './serveFromWebpack'
import SSEConnectionHandler from './sse/SSEConnectionHandler'
import SSEPingHandler from './sse/SSEPingHandler'
import staticFileHandler from './staticFileHandler'
import './utils/dotenv'
import SAMLHandler from './utils/SAMLHandler'

process.on('uncaughtException', (err) => {
  console.log('FIXME UNCAUGHT EXCEPTION', err)
})

const PORT = Number(process.env.PORT)

const ref = makeRefs(__dirname, {
  handleMessage: './socketHandlers/handleMessage',
  handleClose: './socketHandlers/handleClose',
  handleOpen: './socketHandlers/handleOpen'
})

if (!PROD) {
  // directories to watch for changes. doesn't include client for performance reasons
  hotSwap([path.join(__dirname, '../src')])
  getWebpackDevMiddleware()
}

uws
  .App()
  .get('/favicon.ico', PWAHandler)
  .get('/sw.js', PWAHandler)
  .get('/manifest.json', PWAHandler)
  .get('/static/*', staticFileHandler)
  .get('/email/createics', ICSHandler)
  .get('/sse', SSEConnectionHandler)
  .get('/sse-ping', SSEPingHandler)
  .post('/stripe', stripeWebhookHandler)
  .post('/webhooks/github', githubWebhookHandler)
  .post('/graphql', httpGraphQLHandler)
  .post('/intranet-graphql', intranetHttpGraphQLHandler)
  .post('/saml/:domain', SAMLHandler)
  .ws('/*', {
    compression: SHARED_COMPRESSOR,
    idleTimeout: 0,
    maxPayloadLength: 5 * 2 ** 20,
    open: ref.handleOpen,
    message: ref.handleMessage,
    // today, we don't send folks enough data to worry about backpressure
    close: ref.handleClose
  })
  .any('/*', createSSR)
  .listen(PORT, listenHandler)
