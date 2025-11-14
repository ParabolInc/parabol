import './hocusPocus'
import uws from 'uWebSockets.js'
import stripeWebhookHandler from './billing/stripeWebhookHandler'
import {stopChronos} from './chronos'
import createSSR from './createSSR'
import {disconnectAllSockets} from './disconnectAllSockets'
import {setIsShuttingDown} from './getIsShuttingDown'
import ICSHandler from './ICSHandler'
import PWAHandler from './PWAHandler'
import './hocusPocus'
import {hocusPocusHandler} from './hocusPocusHandler'
import {imageProxyHandler} from './imageProxyHandler'
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

const ENABLE_STATIC_FILE_HANDLER = !__PRODUCTION__ || process.env.FILE_STORE_PROVIDER === 'local'
const ENABLE_MATTERMOST_FILE_HANDLER =
  !__PRODUCTION__ || (process.env.MATTERMOST_SECRET && process.env.MATTERMOST_URL)

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
  .get('/email/createics', ICSHandler)
  .get('/self-hosted/*', selfHostedHandler)
  .get('/jira-attachments/:fileName', jiraImagesHandler)
  .get('/images/*', imageProxyHandler)
  .get('/health', yoga)
  .get('/ready', yoga)
  .post('/stripe', stripeWebhookHandler)
  .post('/mattermost', mattermostWebhookHandler)
  .post('/graphql', async (res, req) => {
    // uWS deletes the req before the first await, so we must read it now
    const ip = uwsGetIP(res, req)
    const authToken = await getReqAuth(req)
    return yoga(res, req, {authToken, ip})
  })
  .post('/saml/:domain', SAMLHandler)
  .ws('/yjs', hocusPocusHandler)
  .ws('/*', wsHandler)

if (ENABLE_STATIC_FILE_HANDLER) {
  app.get('/static/*', createStaticFileHandler('/static/'))
} else {
  app.get('/static/*', (res) => {
    res.writeStatus('404 Not Found').end()
  })
}
if (ENABLE_MATTERMOST_FILE_HANDLER) {
  app.get('/components/*', createStaticFileHandler('/components/'))
} else {
  app.get('/components/*', (res) => {
    res.writeStatus('404 Not Found').end()
  })
}

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
