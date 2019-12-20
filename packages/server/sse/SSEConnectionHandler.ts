import url from 'url'
import {verify} from 'jsonwebtoken'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import handleConnect from '../socketHandlers/handleConnect'
import handleDisconnect from '../socketHandlers/handleDisconnect'
import keepAlive from '../socketHelpers/keepAlive'
import express from 'express'
import sseClients from '../sseClients'
import checkBlacklistJWT from '../utils/checkBlacklistJWT'
import closeTransport from '../socketHelpers/closeTransport'
import {TrebuchetCloseReason} from 'parabol-client/types/constEnums'

const APP_VERSION = process.env.npm_package_version
const SERVER_SECRET = process.env.AUTH0_CLIENT_SECRET!
const SSEConnectionHandler = async (req: express.Request, res: express.Response) => {
  const {query} = url.parse(req.url, true)
  let authToken
  try {
    authToken = verify(query.token as string, Buffer.from(SERVER_SECRET, 'base64'))
  } catch (e) {
    res.sendStatus(404)
    return
  }
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    // turn off nginx buffering: https://www.nginx.com/resources/wiki/start/topics/examples/x-accel/#x-accel-buffering
    'X-Accel-Buffering': 'no'
  })
  ;(res as any).socket.setNoDelay() // disable Nagle algorithm
  const {sub: userId, iat} = authToken
  const isBlacklistedJWT = await checkBlacklistJWT(userId, iat)
  if (isBlacklistedJWT) {
    closeTransport(res, 401, TrebuchetCloseReason.EXPIRED_SESSION)
    return
  }
  const connectionContext = new ConnectionContext(res as any, authToken, req.ip)
  sseClients.set(connectionContext)
  const nextAuthToken = await handleConnect(connectionContext)
  res.write(`event: id\n`)
  res.write(`retry: 1000\n`)
  res.write(`data: ${connectionContext.id}\n\n`)
  res.write(`data: ${JSON.stringify({version: APP_VERSION, authToken: nextAuthToken})}\n\n`)
  ;(res as any).flushHeaders()
  keepAlive(connectionContext)
  res.on('close', () => {
    handleDisconnect(connectionContext)
    sseClients.delete(connectionContext.id)
  })
  res.on('finish', () => {
    handleDisconnect(connectionContext)
    sseClients.delete(connectionContext.id)
  })
}

export default SSEConnectionHandler
