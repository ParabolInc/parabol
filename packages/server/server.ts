import tracer from 'dd-trace'
import uws from 'uWebSockets.js'
import sleep from '../client/utils/sleep'
import ICSHandler from './ICSHandler'
import PWAHandler from './PWAHandler'
import {activeClients} from './activeClients'
import stripeWebhookHandler from './billing/stripeWebhookHandler'
import createSSR from './createSSR'
import './hocusPocus'
import './initSentry'
import mattermostWebhookHandler from './integrations/mattermost/mattermostWebhookHandler'
import jiraImagesHandler from './jiraImagesHandler'
import listenHandler from './listenHandler'
import selfHostedHandler from './selfHostedHandler'
import {createStaticFileHandler} from './staticFileHandler'
import {Logger} from './utils/Logger'
import SAMLHandler from './utils/SAMLHandler'
import getReqAuth from './utils/getReqAuth'
import uwsGetIP from './utils/uwsGetIP'
import {wsHandler} from './wsHandler'
import {yoga} from './yoga'

export const RECONNECT_WINDOW = process.env.WEB_SERVER_RECONNECT_WINDOW
  ? parseInt(process.env.WEB_SERVER_RECONNECT_WINDOW, 10) * 1000
  : 60_000 // ms

tracer.init({
  service: `web`,
  appsec: process.env.DD_APPSEC_ENABLED === 'true',
  plugins: false,
  version: __APP_VERSION__
})
tracer
  .use('ioredis')
  .use('http', {
    blocklist: ['/health', '/ready']
  })
  .use('pg')

process.on('SIGTERM', async (signal) => {
  Logger.log(
    `Server ID: ${process.env.SERVER_ID}. Kill signal received: ${signal}, starting graceful shutdown of ${RECONNECT_WINDOW}ms.`
  )
  await Promise.allSettled(
    Array.from(activeClients.values()).map(async (extra) => {
      const disconnectIn = Math.floor(Math.random() * RECONNECT_WINDOW)
      await sleep(disconnectIn)
      extra.socket.end(1012, 'Closing connection')
    })
  )
  Logger.log(`Server ID: ${process.env.SERVER_ID}. Graceful shutdown complete, exiting.`)
  process.exit()
})

const PORT = Number(__PRODUCTION__ ? process.env.PORT : process.env.SOCKET_PORT)
uws
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
  .any('/*', createSSR)
  .listen(PORT, listenHandler)
