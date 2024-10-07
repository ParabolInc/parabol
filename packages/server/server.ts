import tracer from 'dd-trace'
import {r} from 'rethinkdb-ts'
import uws, {SHARED_COMPRESSOR} from 'uWebSockets.js'
import sleep from '../client/utils/sleep'
import ICSHandler from './ICSHandler'
import PWAHandler from './PWAHandler'
import activeClients from './activeClients'
import stripeWebhookHandler from './billing/stripeWebhookHandler'
import createSSR from './createSSR'
import httpGraphQLHandler from './graphql/httpGraphQLHandler'
import intranetGraphQLHandler from './graphql/intranetGraphQLHandler'
import './initSentry'
import jiraImagesHandler from './jiraImagesHandler'
import listenHandler from './listenHandler'
import './monkeyPatchFetch'
import selfHostedHandler from './selfHostedHandler'
import handleClose from './socketHandlers/handleClose'
import handleDisconnect from './socketHandlers/handleDisconnect'
import handleMessage from './socketHandlers/handleMessage'
import handleOpen from './socketHandlers/handleOpen'
import handleUpgrade from './socketHandlers/handleUpgrade'
import SSEConnectionHandler from './sse/SSEConnectionHandler'
import SSEPingHandler from './sse/SSEPingHandler'
import staticFileHandler from './staticFileHandler'
import SAMLHandler from './utils/SAMLHandler'

tracer.init({
  service: `web`,
  appsec: process.env.DD_APPSEC_ENABLED === 'true',
  plugins: false,
  version: process.env.npm_package_version
})
tracer.use('ioredis').use('http').use('pg')

if (!__PRODUCTION__) {
  process.on('SIGINT', async () => {
    r.getPoolMaster()?.drain()
  })
}

process.on('SIGTERM', async (signal) => {
  console.log(
    `Server ID: ${process.env.SERVER_ID}. Kill signal received: ${signal}, starting graceful shutdown.`
  )
  const RECONNECT_WINDOW = 60_000 // ms
  await Promise.allSettled(
    Object.values(activeClients.store).map(async (connectionContext) => {
      const disconnectIn = Math.floor(Math.random() * RECONNECT_WINDOW)
      await sleep(disconnectIn)
      await handleDisconnect(connectionContext)
    })
  )
  console.log(`Server ID: ${process.env.SERVER_ID}. Graceful shutdown complete, exiting.`)
  process.exit()
})

const PORT = Number(__PRODUCTION__ ? process.env.PORT : process.env.SOCKET_PORT)
uws
  .App()
  .get('/favicon.ico', PWAHandler)
  .get('/sw.js', PWAHandler)
  .get('/manifest.json', PWAHandler)
  .get('/static/*', staticFileHandler)
  .get('/email/createics', ICSHandler)
  .get('/sse/*', SSEConnectionHandler)
  .get('/sse-ping', SSEPingHandler)
  .get('/self-hosted/*', selfHostedHandler)
  .get('/jira-attachments/:fileName', jiraImagesHandler)
  .post('/sse-ping', SSEPingHandler)
  .post('/stripe', stripeWebhookHandler)
  .post('/graphql', httpGraphQLHandler)
  .post('/intranet-graphql', intranetGraphQLHandler)
  .post('/saml/:domain', SAMLHandler)
  .ws('/*', {
    compression: SHARED_COMPRESSOR,
    idleTimeout: 0,
    maxPayloadLength: 5 * 2 ** 20,
    upgrade: handleUpgrade,
    open: handleOpen,
    message: handleMessage,
    // today, we don't send folks enough data to worry about backpressure
    close: handleClose
  })
  .any('/*', createSSR)
  .listen(PORT, listenHandler)
