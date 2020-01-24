// Datadog APM, must be first import (disabled for now)
// import './tracer'
import uws from 'uWebSockets.js'
import getDotenv from '../server/utils/dotenv'
import stripeWebhookHandler from './billing/stripeWebhookHandler'
import createSSR from './createSSR'
import httpGraphQLHandler from './graphql/httpGraphQLHandler'
import intranetHttpGraphQLHandler from './graphql/intranetGraphQLHandler'
import './initSentry'
import githubWebhookHandler from './integrations/githubWebhookHandler'
import listenHandler from './listenHandler'
import PROD from './PROD'
import ICSHandler from './ICSHandler'
import {getWebpackDevMiddleware} from './serveFromWebpack'
import PWAHandler from './PWAHandler'
import SSEConnectionHandler from './sse/SSEConnectionHandler'
import SSEPingHandler from './sse/SSEPingHandler'
import staticFileHandler from './staticFileHandler'
import SAMLHandler from './utils/SAMLHandler'
import wsHandler from './wsHandler'

getDotenv()

process.on('uncaughtException', (err) => {
  console.log('FIXME UNCAUGHT EXCEPTION', err)
})

const PORT = Number(process.env.PORT || 3000)

if (!PROD) {
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
  .ws('/*', wsHandler)
  .any('/*', createSSR)
  .listen(PORT, listenHandler)
