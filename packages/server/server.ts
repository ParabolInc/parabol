import uws from 'uWebSockets.js'
import getDotenv from '../server/utils/dotenv'
import stripeWebhookHandler from './billing/stripeWebhookHandler'
import createSSR from './createSSR'
import httpGraphQLHandler from './graphql/httpGraphQLHandler'
import intranetHttpGraphQLHandler from './graphql/intranetGraphQLHandler'
import './initSentry'
import githubWebhookHandler from './integrations/githubWebhookHandler'
import PROD from './PROD'
import sendICS from './sendICS'
import {getWebpackDevMiddleware} from './serveFromWebpack'
import serviceWorkerHandler from './serviceWorkerHandler'
import SSEConnectionHandler from './sse/SSEConnectionHandler'
import SSEPingHandler from './sse/SSEPingHandler'
import staticFileHandler from './staticFileHandler'
import consumeSAML from './utils/consumeSAML'
import getFavicon from './utils/getFavicon'
import wsHandler from './wsHandler'

getDotenv()

process.on('unhandledRejection', (_reason, p) => {
  console.log('Unhandled Rejection at: Promise', p)
})

const PORT = Number(process.env.PORT || 3000)

if (!PROD) {
  getWebpackDevMiddleware()
}

uws
  .App()
  .get('/favicon.ico', getFavicon)
  .get('/static/sw.ts', serviceWorkerHandler)
  .get('/static/:file', staticFileHandler)
  .get('/email/createics', sendICS)
  .get('/sse', SSEConnectionHandler)
  .get('/sse-ping', SSEPingHandler)
  .get('/stripe', stripeWebhookHandler)
  .post('/webhooks/github', githubWebhookHandler)
  .post('/graphql', httpGraphQLHandler)
  .post('/intranet-graphql', intranetHttpGraphQLHandler)
  .post('/saml/:domain', consumeSAML)
  .ws('/*', wsHandler)
  .any('/*', createSSR)
  .listen(PORT, (listenSocket) => {
    if (listenSocket) {
      console.log('\n🔥🔥🔥 Ready for Action 🔥🔥🔥')
    }
  })
