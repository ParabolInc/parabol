// Datadog APM, must be first import (disabled for now)
// import './tracer'

import uws, {SHARED_COMPRESSOR} from 'uWebSockets.js'

let lastPrint
process.on('uncaughtException', (err) => {
  const {message} = err
  if (message === '__webpack_require__(...).default is not a function') {
    if (Date.now() - lastPrint < 1000) return
    lastPrint = Date.now()
    console.log('ERROR: The last file you saved has a syntax error')
    return
  }
  console.log('FIXME UNCAUGHT EXCEPTION', err)
})

const PORT = Number(process.env.PORT)

uws
  .App()
  .get('/email', (...args) => require('./emailSSR').default(...args))
  .get('/favicon.ico', (...args) => require('./PWAHandler').default(...args))
  .get('/sw.js', (...args) => require('./PWAHandler').default(...args))
  .get('/manifest.json', (...args) => require('./PWAHandler').default(...args))
  .get('/static/*', (...args) => require('./staticFileHandler').default(...args))
  .get('/email/createics', (...args) => require('./ICSHandler').default(...args))
  .get('/sse', (...args) => require('./sse/SSEConnectionHandler').default(...args))
  .get('/sse-ping', (...args) => require('./sse/SSEPingHandler').default(...args))
  .get('/self-hosted/*', (...args) => require('./selfHostedHandler').default(...args))
  .post('/stripe', (...args) => require('./billing/stripeWebhookHandler').default(...args))
  .post('/webhooks/github', (...args) =>
    require('./integrations/githubWebhookHandler').default(...args)
  )
  .post('/webhooks/graphql', (...args) =>
    require('./graphql/webhookGraphQLHandler').default(...args)
  )
  .post('/graphql', (...args) => require('./graphql/httpGraphQLHandler').default(...args))
  .post('/intranet-graphql', (...args) =>
    require('./graphql/intranetGraphQLHandler').default(...args)
  )
  .post('/saml/:domain', (...args) => require('./utils/SAMLHandler').default(...args))
  .ws('/*', {
    compression: SHARED_COMPRESSOR,
    idleTimeout: 0,
    maxPayloadLength: 5 * 2 ** 20,
    upgrade: (...args) => require('./socketHandlers/handleUpgrade').default(...args),
    open: (...args) => require('./socketHandlers/handleOpen').default(...args),
    message: (...args) => require('./socketHandlers/handleMessage').default(...args),
    // today, we don't send folks enough data to worry about backpressure
    close: (...args) => require('./socketHandlers/handleClose').default(...args)
  })
  .any('/*', (...args) => require('./createSSR').default(...args))
  .listen(PORT, (...args) => require('./listenHandler').default(...args))

require('./serveFromWebpack').getWebpackDevMiddleware()
// Development server details

if (module.hot) {
  module.hot.accept([
    './serveFromWebpack',
    './ICSHandler',
    './PWAHandler',
    './listenHandler',
    './billing/stripeWebhookHandler',
    './integrations/githubWebhookHandler',
    './sse/SSEConnectionHandler',
    './sse/SSEPingHandler',
    './staticFileHandler',
    './utils/SAMLHandler',
    './graphql/webhookGraphQLHandler',
    './graphql/httpGraphQLHandler',
    './graphql/intranetGraphQLHandler',
    './createSSR',
    './socketHandlers/handleUpgrade',
    './socketHandlers/handleMessage',
    './socketHandlers/handleClose',
    './socketHandlers/handleOpen'
  ])
}
