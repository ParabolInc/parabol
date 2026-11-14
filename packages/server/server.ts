import './hocusPocus'
import uws from 'uWebSockets.js'
import sleep from '../client/utils/sleep'
import {assetProxyHandler} from './assetProxyHandler'
import stripeWebhookHandler from './billing/stripeWebhookHandler'
import {buildProxyHandler} from './buildProxyHandler'
import {stopChronos} from './chronos'
import {clientErrorsHandler} from './clientErrorsHandler'
import {clientMetricsHandler} from './clientMetricsHandler'
import createSSR from './createSSR'
import {disconnectAllSockets} from './disconnectAllSockets'
import {setIsRefusingSockets, setIsShuttingDown} from './getIsShuttingDown'
import {hocusPocusHandler} from './hocusPocusHandler'
import mattermostWebhookHandler from './integrations/mattermost/mattermostWebhookHandler'
import zoomWebhookHandler from './integrations/zoom/zoomWebhookHandler'
import {requireInstanceLicense} from './license/instanceLicense'
import listenHandler from './listenHandler'
import {ENABLE_METRICS, METRICS_PORT, metricsHandler} from './metricsHandler'
import authorizeHandler from './oauth2/authorizeHandler'
import tokenHandler from './oauth2/tokenHandler'
import PWAHandler from './PWAHandler'
import {schemaProxyHandler} from './schemaProxyHandler'
import {registerSCIMHandlers} from './scim/SCIMHandler'
import selfHostedHandler from './selfHostedHandler'
import socketDrainSchedule from './socketDrainSchedule'
import {createStaticFileHandler} from './staticFileHandler'
import {flushTracing} from './tracing/initTracing'
import traceHttpRoute from './tracing/traceHttpRoute'
import getReqAuth from './utils/getReqAuth'
import {Logger, setAccountLogContextLoader} from './utils/Logger'
import loadAccountLogContext from './utils/loadAccountLogContext'
import logProcessWarnings from './utils/logProcessWarnings'
import parseSessionId from './utils/parseSessionId'
import registerFatalErrorHandlers from './utils/registerFatalErrorHandlers'
import SAMLHandler from './utils/SAMLHandler'
import logHocuspocusWarnings from './utils/tiptap/logHocuspocusWarnings'
import uwsGetIP from './utils/uwsGetIP'
import {wsHandler} from './wsHandler'
import {yoga} from './yoga'

const PORT = Number(__PRODUCTION__ ? process.env.PORT : process.env.SOCKET_PORT)

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

registerFatalErrorHandlers()
setAccountLogContextLoader(loadAccountLogContext)
logProcessWarnings()
requireInstanceLicense()
logHocuspocusWarnings()

process.on('SIGTERM', async (signal) => {
  Logger.log(
    `Server ID: ${process.env.SERVER_ID}. Kill signal received: ${signal}, starting graceful shutdown of ${socketDrainSchedule.reconnectWindow}ms.`
  )
  setIsShuttingDown()
  stopChronos()
  await sleep(socketDrainSchedule.loadBalancerDelay)
  setIsRefusingSockets()
  await disconnectAllSockets()
  await flushTracing()
  Logger.log(`Server ID: ${process.env.SERVER_ID}. Graceful shutdown complete, exiting.`)
  process.exit()
})

const app = uws
  .App()
  .get('/favicon.ico', PWAHandler)
  .get('/sw.js', PWAHandler)
  .get('/manifest.json', PWAHandler)
  .get('/self-hosted/*', selfHostedHandler)
  .get('/assets/*', traceHttpRoute('/assets/*', assetProxyHandler))
  .get('/build/*', traceHttpRoute('/build/*', buildProxyHandler))
  .get('/graphql/*', traceHttpRoute('/graphql/*', schemaProxyHandler))
  .get('/health', yoga)
  .get('/ready', yoga)
  .post('/stripe', traceHttpRoute('/stripe', stripeWebhookHandler))
  .get('/stripe', (res) => {
    res.writeStatus('405 Method Not Allowed').writeHeader('Allow', 'POST').end()
  })
  .post('/mattermost', traceHttpRoute('/mattermost', mattermostWebhookHandler))
  .post('/zoom', traceHttpRoute('/zoom', zoomWebhookHandler))
  .post('/client-errors', traceHttpRoute('/client-errors', clientErrorsHandler))
  .post('/client-metrics', traceHttpRoute('/client-metrics', clientMetricsHandler))
  .post('/graphql', async (res, req) => {
    // uWS deletes the req before the first await, so we must read it now
    const ip = uwsGetIP(res, req)
    const authToken = getReqAuth(req)
    const traceparent = req.getHeader('traceparent') || undefined
    const sessionId = parseSessionId(req.getHeader('x-parabol-session-id'))
    return yoga(res, req, {authToken, ip, traceparent, sessionId})
  })
  .post('/saml/:domain', traceHttpRoute('/saml/:domain', SAMLHandler))
  .get('/oauth/authorize', traceHttpRoute('/oauth/authorize', authorizeHandler))
  .post('/oauth/token', traceHttpRoute('/oauth/token', tokenHandler))
  .ws('/yjs', hocusPocusHandler)
  .ws('/*', wsHandler)
registerSCIMHandlers(app, '/scim')

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
        Logger.log(`Metrics server listening on port ${METRICS_PORT}`)
      } else {
        Logger.error(
          `Failed to bind metrics server on port ${METRICS_PORT}; serving without metrics`
        )
      }
    })
}

app.any('/*', createSSR).listen(PORT, listenHandler)
