// Datadog APM, must be first import (disabled for now)
// import './tracer'

import uws, {SHARED_COMPRESSOR} from 'uWebSockets.js'
import rootSchema from './graphql/rootSchema'
import './initSentry'
import PROD from './PROD'

process.on('uncaughtException', (err) => {
  console.log('FIXME UNCAUGHT EXCEPTION', err)
})

const PORT = Number(process.env.PORT)

uws
  .App()
  .get('/favicon.ico', (...args) => require('./PWAHandler').default(...args))
  .get('/sw.js', (...args) => require('./PWAHandler').default(...args))
  .get('/manifest.json', (...args) => require('./PWAHandler').default(...args))
  .get('/static/*', (...args) => require('./staticFileHandler').default(...args))
  .get('/email/createics', (...args) => require('./ICSHandler').default(...args))
  .get('/sse', (...args) => require('./sse/SSEConnectionHandler').default(...args))
  .get('/sse-ping', (...args) => require('./sse/SSEPingHandler').default(...args))
  .post('/stripe', (...args) => require('./billing/stripeWebhookHandler').default(...args))
  .post('/webhooks/github', (...args) =>
    require('./integrations/githubWebhookHandler').default(...args)
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
    open: (...args) => require('./socketHandlers/handleOpen').default(...args),
    message: (...args) => require('./socketHandlers/handleMessage').default(...args),
    // today, we don't send folks enough data to worry about backpressure
    close: (...args) => require('./socketHandlers/handleClose').default(...args)
  })
  .any('/*', (...args) => require('./createSSR').default(...args))
  .listen(PORT, (...args) => require('./listenHandler').default(...args))

// Development server details

if (!PROD && module.hot) {
  const rootSchemaRef = {current: rootSchema}
  const schemaCtx = {oldSchema: '', delay: 3000}
  module.hot.accept(
    [
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
      './graphql/httpGraphQLHandler',
      './graphql/intranetGraphQLHandler',
      './createSSR',
      './socketHandlers/handleMessage',
      './socketHandlers/handleClose',
      './socketHandlers/handleOpen',
      // these are just needed to keep the gql schema fresh
      './graphql/rootSchema',
      './utils/updateGQLSchema'
    ],
    () => {
      // update the gql schema here vs. in a helper file because we've alreayd parsed it here
      try {
        const nextRootSchema = require('./graphql/rootSchema').default
        if (nextRootSchema === rootSchemaRef.current) return
        rootSchemaRef.current = nextRootSchema
        const updateGQLSchema = require('./utils/updateGQLSchema').default
        updateGQLSchema(schemaCtx)
      } catch (e) {
        console.log('failed to update, setting good')
        // ignore
      }
    }
  )
}

if (!PROD) {
  require('./serveFromWebpack').getWebpackDevMiddleware()
}
