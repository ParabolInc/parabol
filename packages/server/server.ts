import {WebSocketServer} from '@clusterws/cws'
import * as Integrations from '@sentry/integrations'
import * as Sentry from '@sentry/node'
import bodyParser from 'body-parser'
import compression from 'compression'
import cors from 'cors'
import express from 'express'
import jwt from 'express-jwt'
import rateLimit from 'express-rate-limit'
import * as heapProfile from 'heap-profile'
import http from 'http'
import ms from 'ms'
import path from 'path'
import favicon from 'serve-favicon'
import getDotenv from '../server/utils/dotenv'
import stripeWebhookHandler from './billing/stripeWebhookHandler'
import createSSR from './createSSR'
import demoEntityHandler from './demoEntityHandler'
import emailSSR from './emailSSR'
import httpGraphQLHandler from './graphql/httpGraphQLHandler'
import intranetHttpGraphQLHandler from './graphql/intranetGraphQLHandler'
import githubWebhookHandler from './integrations/githubWebhookHandler'
import sendICS from './sendICS'
import wssConnectionHandler from './socketHandlers/wssConnectionHandler'
import SSEConnectionHandler from './sse/SSEConnectionHandler'
import SSEPingHandler from './sse/SSEPingHandler'
import consumeSAML from './utils/consumeSAML'

getDotenv()
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
const SERVER_SECRET = process.env.AUTH0_CLIENT_SECRET!

let highWaterMark = 0
setTimeout(() => {
  heapProfile.start()
  setInterval(() => {
    const memoryUsage = process.memoryUsage()
    const {rss} = memoryUsage
    const MB = 2 ** 20
    const usedMB = Math.floor(rss / MB)
    if (usedMB > highWaterMark + 50) {
      // only profile if it's gonna be interesting
      highWaterMark = usedMB
      const fileName = `sample_${Date.now()}_${usedMB}.heapprofile`
      heapProfile.write(path.join(PROJECT_ROOT, fileName))
    }
  }, ms('1h')).unref()
}, 1000)

// Import .env and expand variables:
const PROD = process.env.NODE_ENV === 'production'
const {PORT = 3000} = process.env

const app = express()
const server = http.createServer(app)
const wss = new WebSocketServer({server})
server.listen(PORT)
// This houses a per-mutation dataloader. When GraphQL is its own microservice, we can move this there.

// keep a hash table of connection contexts
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
app.post(
  '/graphql',
  jwt({
    secret: Buffer.from(SERVER_SECRET, 'base64'),
    credentialsRequired: false
  }),
  httpGraphQLHandler
)

// HTTP Intranet GraphQL endpoint:
app.post(
  '/intranet-graphql',
  jwt({
    secret: Buffer.from(SERVER_SECRET, 'base64'),
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

// SSE Fallback
app.get('/sse-ping', SSEPingHandler)
app.get('/sse', SSEConnectionHandler)

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
wss.on('connection', wssConnectionHandler)
