import tracer from 'dd-trace'
import uws, {SHARED_COMPRESSOR, WebSocket} from 'uWebSockets.js'
import sleep from '../client/utils/sleep'
import ICSHandler from './ICSHandler'
import PWAHandler from './PWAHandler'
import activeClients from './activeClients'
import stripeWebhookHandler from './billing/stripeWebhookHandler'
import createSSR from './createSSR'
import httpGraphQLHandler from './graphql/httpGraphQLHandler'
import intranetGraphQLHandler from './graphql/intranetGraphQLHandler'
import './initSentry'
import mattermostWebhookHandler from './integrations/mattermost/mattermostWebhookHandler'
import jiraImagesHandler from './jiraImagesHandler'
import listenHandler from './listenHandler'
import {
  decrementWebSocketConnections,
  handleMetricsRequest,
  incrementWebSocketConnections,
  trackWebSocketOpen,
  trackWsMessageReceived
} from './metrics'
import './monkeyPatchFetch'
import selfHostedHandler from './selfHostedHandler'
import handleClose from './socketHandlers/handleClose'
import handleDisconnect from './socketHandlers/handleDisconnect'
import handleMessage from './socketHandlers/handleMessage'
import handleOpen from './socketHandlers/handleOpen'
import handleUpgrade from './socketHandlers/handleUpgrade'
import SSEConnectionHandler from './sse/SSEConnectionHandler'
import SSEPingHandler from './sse/SSEPingHandler'
import {createStaticFileHandler} from './staticFileHandler'
import {Logger} from './utils/Logger'
import SAMLHandler from './utils/SAMLHandler'

export const RECONNECT_WINDOW = process.env.WEB_SERVER_RECONNECT_WINDOW
  ? parseInt(process.env.WEB_SERVER_RECONNECT_WINDOW, 10) * 1000
  : 60_000 // ms

tracer.init({
  service: `web`,
  appsec: process.env.DD_APPSEC_ENABLED === 'true',
  plugins: false,
  version: __APP_VERSION__
})
tracer.use('ioredis').use('http').use('pg')

process.on('SIGTERM', async (signal) => {
  Logger.log(
    `Server ID: ${process.env.SERVER_ID}. Kill signal received: ${signal}, starting graceful shutdown of ${RECONNECT_WINDOW}ms.`
  )
  await Promise.allSettled(
    Object.values(activeClients.store).map(async (connectionContext) => {
      const disconnectIn = Math.floor(Math.random() * RECONNECT_WINDOW)
      await sleep(disconnectIn)
      await handleDisconnect(connectionContext)
    })
  )
  Logger.log(`Server ID: ${process.env.SERVER_ID}. Graceful shutdown complete, exiting.`)
  process.exit()
})

const PORT = Number(__PRODUCTION__ ? process.env.PORT : process.env.SOCKET_PORT)
const METRICS_PORT = Number(process.env.METRICS_PORT || 9090) // Default to 9090

// Main App
uws
  .App()
  .get('/favicon.ico', PWAHandler)
  .get('/sw.js', PWAHandler)
  .get('/manifest.json', PWAHandler)
  .get('/static/*', createStaticFileHandler('/static/'))
  .get('/components/*', createStaticFileHandler('/components/'))
  .get('/email/createics', ICSHandler)
  .get('/sse/*', SSEConnectionHandler)
  .get('/sse-ping', SSEPingHandler)
  .get('/self-hosted/*', selfHostedHandler)
  .get('/jira-attachments/:fileName', jiraImagesHandler)
  .post('/sse-ping', SSEPingHandler)
  .post('/stripe', stripeWebhookHandler)
  .post('/mattermost', mattermostWebhookHandler)
  .post('/graphql', httpGraphQLHandler)
  .post('/intranet-graphql', intranetGraphQLHandler)
  .post('/saml/:domain', SAMLHandler)
  .ws('/*', {
    compression: SHARED_COMPRESSOR,
    idleTimeout: 0,
    maxPayloadLength: 5 * 2 ** 20,
    upgrade: handleUpgrade,
    open: (ws: WebSocket<any>) => {
      incrementWebSocketConnections()
      trackWebSocketOpen(ws)
      if (handleOpen) handleOpen(ws)
    },
    message: (ws: WebSocket<any>, message: ArrayBuffer, isBinary: boolean) => {
      trackWsMessageReceived()
      if (handleMessage) handleMessage(ws, message, isBinary)
    },
    close: (ws: WebSocket<any>) => {
      decrementWebSocketConnections(ws)
      handleClose(ws)
    }
  })
  .any('/*', createSSR)
  .listen(PORT, listenHandler)

// Metrics App (only start if ENABLE_METRICS is 'true')
if (process.env.ENABLE_METRICS === 'true') {
  uws
    .App()
    .get('/metrics', handleMetricsRequest)
    .listen(METRICS_PORT, (listenSocket) => {
      if (listenSocket) {
        Logger.log(`📊📊📊 Metrics server listening on port ${METRICS_PORT} 📊📊📊`)
      } else {
        Logger.error('Failed to start metrics server')
      }
    })
}
