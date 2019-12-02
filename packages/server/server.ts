import path from 'path'
import express from 'express'
import compression from 'compression'
import cors from 'cors'
import bodyParser from 'body-parser'
import jwt from 'express-jwt'
import favicon from 'serve-favicon'
import * as Sentry from '@sentry/node'
import createSSR from './createSSR'
import emailSSR from './emailSSR'
import {clientSecret as secretKey} from './utils/auth0Helpers'
import connectionHandler from './socketHandlers/wssConnectionHandler'
import httpGraphQLHandler from './graphql/httpGraphQLHandler'
import stripeWebhookHandler from './billing/stripeWebhookHandler'
import getDotenv from '../server/utils/dotenv'
import sendICS from './sendICS'
import githubWebhookHandler from './integrations/githubWebhookHandler'
import DataLoaderWarehouse from 'dataloader-warehouse'
import {WebSocketServer} from '@clusterws/cws'
import http from 'http'
// import startMemwatch from 'server/utils/startMemwatch'
import {SHARED_DATA_LOADER_TTL} from './utils/serverConstants'
import RateLimiter from './graphql/RateLimiter'
import SSEConnectionHandler from './sse/SSEConnectionHandler'
import intranetHttpGraphQLHandler from './graphql/intranetGraphQLHandler'
import SSEPingHandler from './sse/SSEPingHandler'
import ms from 'ms'
import rateLimit from 'express-rate-limit'
import demoEntityHandler from './demoEntityHandler'
import * as Integrations from '@sentry/integrations'
import consumeSAML from './utils/consumeSAML'
import * as heapProfile from 'heap-profile'

declare global {
  namespace NodeJS {
    interface Global {
      __rootdir__: string
    }
  }
}

interface StripeRequest extends express.Request {
  rawBody: string
}

const APP_VERSION = process.env.npm_package_version
const PROJECT_ROOT = path.join(__dirname, '..', '..')

setTimeout(() => {
  heapProfile.start()
  setInterval(() => {
    const memoryUsage = process.memoryUsage()
    const {rss} = memoryUsage
    const MB = 2 ** 20
    const usedMB = Math.floor(rss / MB)
    const fileName = `sample_${Date.now()}_${usedMB}.heapprofile`
    heapProfile.write(path.join(PROJECT_ROOT, fileName))
  }, ms('1h')).unref()
}, 1000)

// Import .env and expand variables:
getDotenv()
const PROD = process.env.NODE_ENV === 'production'
const {PORT = 3000} = process.env

const app = express()
const server = http.createServer(app)
const wss = new WebSocketServer({server})
server.listen(PORT)
// This houses a per-mutation dataloader. When GraphQL is its own microservice, we can move this there.
const sharedDataLoader = new DataLoaderWarehouse({
  onShare: '_share',
  ttl: SHARED_DATA_LOADER_TTL
})
const rateLimiter = new RateLimiter()
// keep a hash table of connection contexts
const sseClients = {}
Sentry.init({
  environment: 'server',
  dsn: process.env.SENTRY_DSN,
  release: APP_VERSION,
  ignoreErrors: ['429 Too Many Requests', /language \S+ is not supported/],
  integrations: [
    new Integrations.RewriteFrames({
      root: global.__rootdir__
    })
  ]
})

app.use(
  '/static',
  express.static(path.join(PROJECT_ROOT, 'build'), {
    setHeaders: (res, path) => {
      if (path.endsWith('sw.js')) {
        res.setHeader('service-worker-allowed', '/')
      }
    }
  })
)

// HMR
if (!PROD) {
  const config = require('./webpack/webpack.dev.config')
  const hotClient = require('webpack-hot-client')
  const webpack = require('webpack')
  const compiler = webpack(config)
  hotClient(compiler, {port: 8082})
  // hotClient(compiler, {port: 8082, host: '192.168.1.103'})
  app.use(
    require('webpack-dev-middleware')(compiler, {
      logLevel: 'warn',
      noInfo: true,
      quiet: true,
      publicPath: config.output.publicPath,
      // writeToDisk: true, // required for developing serviceWorkers
      stats: {
        assets: false,
        builtAt: false,
        cached: false,
        cachedAssets: false,
        chunks: false,
        chunkGroups: false,
        chunkModules: false,
        chunkOrigins: false,
        colors: true,
        entrypoints: false,
        hash: false,
        modules: false,
        version: false
      },
      watchOptions: {
        aggregateTimeout: 300
      }
    })
  )
} else {
  // sentry.io request handler capture middleware, must be first:
  app.use(Sentry.Handlers.requestHandler())
}

// setup middleware
app.use(
  bodyParser.json({
    verify: (req: express.Request, _res: express.Response, buf) => {
      if (req.originalUrl.startsWith('/stripe')) {
        ;(req as StripeRequest).rawBody = buf.toString()
      }
    }
  })
)
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors({origin: true, credentials: true}))
app.use('/static', express.static(path.join(PROJECT_ROOT, 'static')))
app.use(favicon(path.join(PROJECT_ROOT, 'static', 'favicon.ico')))
if (PROD) {
  app.use(compression())
} else {
  app.use('/static', express.static(path.join(__dirname, './webpack/dll')))
}

// HTTP GraphQL endpoint
const graphQLHandler = httpGraphQLHandler(sharedDataLoader, rateLimiter, sseClients)
app.post(
  '/graphql',
  jwt({
    secret: Buffer.from(secretKey, 'base64'),
    audience: process.env.AUTH0_CLIENT_ID,
    credentialsRequired: false
  }),
  graphQLHandler
)

// HTTP Intranet GraphQL endpoint:
app.post(
  '/intranet-graphql',
  jwt({
    secret: Buffer.from(secretKey, 'base64'),
    credentialsRequired: true
  }),
  intranetHttpGraphQLHandler
)

// server-side rendering for emails
if (!PROD) {
  app.get('/email/:template', emailSSR)
}
app.get('/email/createics', sendICS)

// stripe webhooks
app.post('/stripe', stripeWebhookHandler)

app.post('/webhooks/github', githubWebhookHandler)

// app.post('/rtc-fallback', WRTCFallbackHandler(sharedDataLoader, rateLimiter))

// SSE Fallback
app.get('/sse-ping', SSEPingHandler(sseClients))
app.get('/sse', SSEConnectionHandler(sharedDataLoader, rateLimiter, sseClients))

// Entity generator for demo
app.enable('trust proxy')
const demoEntityLimiter = rateLimit({
  windowMs: ms('1h'),
  max: 20
})
app.post('/get-demo-entities', demoEntityLimiter, demoEntityHandler)

app.post('/saml/:domain', consumeSAML)

// return web app
app.get('*', createSSR)

// handle sockets
wss.on('connection', connectionHandler(sharedDataLoader, rateLimiter))
