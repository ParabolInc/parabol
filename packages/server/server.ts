import uws from 'uWebSockets.js'
import stripeWebhookHandler from './billing/stripeWebhookHandler'
import {stopChronos} from './chronos'
import createSSR from './createSSR'
import {disconnectAllSockets} from './disconnectAllSockets'
import {setIsShuttingDown} from './getIsShuttingDown'
import ICSHandler from './ICSHandler'
import PWAHandler from './PWAHandler'
import './hocusPocus'
import {fetch} from '@whatwg-node/fetch'
import mattermostWebhookHandler from './integrations/mattermost/mattermostWebhookHandler'
import jiraImagesHandler from './jiraImagesHandler'
import listenHandler from './listenHandler'
import {metricsHandler} from './metricsHandler'
import selfHostedHandler from './selfHostedHandler'
import {createStaticFileHandler} from './staticFileHandler'
import getReqAuth from './utils/getReqAuth'
import {Logger} from './utils/Logger'
import SAMLHandler from './utils/SAMLHandler'
import uwsGetIP from './utils/uwsGetIP'
import {wsHandler} from './wsHandler'
import {yoga} from './yoga'

// undici has a memory leak in Node v22 (and it looks like v24 as well).
// by monkeypatching fetch, we fix it for all our code as well as calls that exist in our dependencies
globalThis.fetch = fetch

export const RECONNECT_WINDOW = process.env.WEB_SERVER_RECONNECT_WINDOW
  ? parseInt(process.env.WEB_SERVER_RECONNECT_WINDOW, 10) * 1000
  : 60_000

const PORT = Number(__PRODUCTION__ ? process.env.PORT : process.env.SOCKET_PORT)

export const ENABLE_METRICS = process.env.ENABLE_METRICS === 'true'
export const METRICS_PORT = process.env.METRICS_PORT ? parseInt(process.env.METRICS_PORT, 10) : NaN
if (ENABLE_METRICS) {
  if (isNaN(METRICS_PORT)) {
    throw new Error('ENABLE_METRICS is true but METRICS_PORT is invalid')
  }
  if (METRICS_PORT === PORT) {
    throw new Error('METRICS_PORT cannot be the same as PORT')
  }
}

process.on('SIGTERM', async (signal) => {
  Logger.log(
    `Server ID: ${process.env.SERVER_ID}. Kill signal received: ${signal}, starting graceful shutdown of ${RECONNECT_WINDOW}ms.`
  )
  setIsShuttingDown()
  stopChronos()
  await disconnectAllSockets()
  Logger.log(`Server ID: ${process.env.SERVER_ID}. Graceful shutdown complete, exiting.`)
  process.exit()
})

const app = uws
  .App()
  .get('/favicon.ico', PWAHandler)
  .get('/sw.js', PWAHandler)
  .get('/manifest.json', PWAHandler)
  .get('/static/*', createStaticFileHandler('/static/'))
  .get('/components/*', createStaticFileHandler('/components/'))
  .get('/email/createics', ICSHandler)
  .get('/self-hosted/*', selfHostedHandler)
  .get('/jira-attachments/:fileName', jiraImagesHandler)
  .get('/health', yoga)
  .get('/ready', yoga)
  .post('/stripe', stripeWebhookHandler)
  .post('/mattermost', mattermostWebhookHandler)
  .post('/graphql', (res, req) => {
    // uWS deletes the req before the first await, so we must read it now
    const authToken = getReqAuth(req)
    const ip = uwsGetIP(res, req)
    return yoga(res, req, {authToken, ip})
  })
  .post('/saml/:domain', SAMLHandler)
  .ws('/*', wsHandler)

if (ENABLE_METRICS) {
  uws
    .App()
    .get('/metrics', metricsHandler)
    .get('/health', (res) => {
      res.writeStatus('200 OK')
      res.writeHeader('Content-Type', 'text/plain')
      res.end('OK')
    })
    .listen(METRICS_PORT, (socket) => {
      if (socket) {
        console.log(`Metrics server listening on port ${METRICS_PORT}`)
      } else {
        console.error(`Failed to bind metrics server on port ${METRICS_PORT}`)
        process.exit(1)
      }
    })
}

app.any('/*', createSSR).listen(PORT, listenHandler)
