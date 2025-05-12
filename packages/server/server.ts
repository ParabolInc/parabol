import uws from 'uWebSockets.js'
import ICSHandler from './ICSHandler'
import PWAHandler from './PWAHandler'
import stripeWebhookHandler from './billing/stripeWebhookHandler'
import {stopChronos} from './chronos'
import createSSR from './createSSR'
import {disconnectAllSockets} from './disconnectAllSockets'
import {setIsShuttingDown} from './getIsShuttingDown'
import './hocusPocus'
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
