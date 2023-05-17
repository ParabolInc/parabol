import tracer from 'dd-trace'
import {r} from 'rethinkdb-ts'
import uws, {SHARED_COMPRESSOR} from 'uWebSockets.js'
import stripeWebhookHandler from './billing/stripeWebhookHandler'
import createSSR from './createSSR'
import httpGraphQLHandler from './graphql/httpGraphQLHandler'
import intranetGraphQLHandler from './graphql/intranetGraphQLHandler'
import webhookGraphQLHandler from './graphql/webhookGraphQLHandler'
import ICSHandler from './ICSHandler'
import './initSentry'
import githubWebhookHandler from './integrations/githubWebhookHandler'
import jiraImagesHandler from './jiraImagesHandler'
import listenHandler from './listenHandler'
import PROD from './PROD'
import PWAHandler from './PWAHandler'
import selfHostedHandler from './selfHostedHandler'
import handleClose from './socketHandlers/handleClose'
import handleMessage from './socketHandlers/handleMessage'
import handleOpen from './socketHandlers/handleOpen'
import handleUpgrade from './socketHandlers/handleUpgrade'
import SSEConnectionHandler from './sse/SSEConnectionHandler'
import SSEPingHandler from './sse/SSEPingHandler'
import staticFileHandler from './staticFileHandler'
import SAMLHandler from './utils/SAMLHandler'
import ServerHealthChecker from './utils/ServerHealthChecker'

tracer.init({
  service: `Web ${process.env.SERVER_ID}`,
  appsec: process.env.DD_APPSEC_ENABLED === 'true',
  plugins: false
})
tracer.use('ioredis').use('http').use('pg').use('fs')

const onKill = async () => {
  r.getPoolMaster()?.drain()
  const healthChecker = new ServerHealthChecker()
  await healthChecker.reportDeadServers([process.env.SERVER_ID!])
  process.exit()
}

// If the process is getting killed, remove all the user presence from redis
process.on('SIGTERM', onKill)
if (!PROD) {
  process.on('SIGINT', async () => {
    r.getPoolMaster()?.drain()
    onKill()
  })
}

const PORT = Number(PROD ? process.env.PORT : process.env.SOCKET_PORT)
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
  .post('/webhooks/github', githubWebhookHandler)
  .post('/webhooks/graphql', webhookGraphQLHandler)
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
