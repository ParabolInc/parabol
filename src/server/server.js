import express from 'express'
import webpack from 'webpack' // eslint-disable-line import/no-extraneous-dependencies
import compression from 'compression'
import cors from 'cors'
import bodyParser from 'body-parser'
import jwt from 'express-jwt'
import favicon from 'serve-favicon'
import Raven from 'raven'
import createSSR from './createSSR'
import emailSSR from './emailSSR'
import {clientSecret as secretKey} from './utils/auth0Helpers'
import connectionHandler from './socketHandlers/wssConnectionHandler'
import httpGraphQLHandler from './graphql/httpGraphQLHandler'
import stripeWebhookHandler from './billing/stripeWebhookHandler'
import getDotenv from '../universal/utils/dotenv'
import handleIntegration from './integrations/handleIntegration'
import sendICS from './sendICS'
import './polyfills'
import {GITHUB, SLACK} from '../universal/utils/constants'
import handleGitHubWebhooks from 'server/integrations/handleGitHubWebhooks'
import SharedDataLoader from 'shared-dataloader'
import {Server} from 'uws'
import http from 'http'
// import startMemwatch from 'server/utils/startMemwatch'
import packageJSON from '../../package.json'
import jwtFields from 'universal/utils/jwtFields'
import {SHARED_DATA_LOADER_TTL} from 'server/utils/serverConstants'
import RateLimiter from 'server/graphql/RateLimiter'
import SSEConnectionHandler from 'server/sse/SSEConnectionHandler'
import intranetHttpGraphQLHandler from 'server/graphql/intranetGraphQLHandler'
import SSEPingHandler from 'server/sse/SSEPingHandler'
import ms from 'ms'
import rateLimit from 'express-rate-limit'
import demoEntityHandler from 'server/demoEntityHandler'

const {version} = packageJSON
// Import .env and expand variables:
getDotenv()

const PROD = process.env.NODE_ENV === 'production'
const {PORT = 3000} = process.env

const app = express()
const server = http.createServer(app)
const wss = new Server({server})
server.listen(PORT)
// This houses a per-mutation dataloader. When GraphQL is its own microservice, we can move this there.
const sharedDataLoader = new SharedDataLoader({
  PROD,
  onShare: '_share',
  ttl: SHARED_DATA_LOADER_TTL
})
const rateLimiter = new RateLimiter()
// keep a hash table of connection contexts
const sseClients = {}

// HMR
if (!PROD) {
  const config = require('../../webpack/webpack.dev.config')
  const hotClient = require('webpack-hot-client')
  const compiler = webpack(config)
  hotClient(compiler, {port: 8082})
  // hotClient(compiler, {port: 8082, host: '192.168.1.103'})
  app.use(
    require('webpack-dev-middleware')(compiler, {
      logLevel: 'warn',
      noInfo: true,
      quiet: true,
      publicPath: config.output.publicPath,
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
        poll: true,
        aggregateTimeout: 300
      }
    })
  )
} else {
  Raven.config(process.env.SENTRY_DSN, {
    release: version,
    environment: process.env.NODE_ENV,
    parseUser: jwtFields
  }).install()
  // sentry.io request handler capture middleware, must be first:
  app.use(Raven.requestHandler())
}

// setup middleware
app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      if (req.originalUrl.startsWith('/stripe')) {
        req.rawBody = buf.toString()
      }
    }
  })
)

app.use(cors({origin: true, credentials: true}))
app.use('/static', express.static('static'))
app.use(favicon(`${__dirname}/../../static/favicon.ico`))
app.use('/static', express.static('build'))
if (PROD) {
  app.use(compression())
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
const intranetGraphQLHandler = intranetHttpGraphQLHandler(sharedDataLoader)
app.post(
  '/intranet-graphql',
  jwt({
    secret: Buffer.from(secretKey, 'base64'),
    credentialsRequired: true
  }),
  intranetGraphQLHandler
)

// server-side rendering for emails
if (!PROD) {
  app.get('/email/:template', emailSSR)
}
app.get('/email/createics', sendICS)

// stripe webhooks
app.post('/stripe', stripeWebhookHandler(sharedDataLoader))

app.get('/auth/github', handleIntegration(GITHUB))
app.get('/auth/slack', handleIntegration(SLACK))
app.post('/webhooks/github', handleGitHubWebhooks)

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

// return web app
app.get('*', createSSR)

// handle sockets
wss.on('connection', connectionHandler(sharedDataLoader, rateLimiter))
