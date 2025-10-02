import './hocusPocus'
import type {IncomingHttpHeaders} from 'node:http2'
import type {UpgradeData} from 'graphql-ws/use/uWebSockets'
import {hocuspocus} from './hocusPocus'
import './hocusPocus'
import type {WebSocketBehavior} from 'uWebSockets.js'
import {IncomingMessage} from '@hocuspocus/server'
import {Redlock} from '@sesamecare-oss/redlock'
import {readVarString} from 'lib0/decoding'
import {pack} from 'msgpackr'
import {HocusPocusWebSocket} from './HocusPocusWebSocket'
import getRedis from './utils/getRedis'
import {yjsProxy} from './YJSProxy'

type HocusPocusRequest = UpgradeData['persistedRequest'] & {socket: {remoteAddress: string}}
type HocusPocusSocketData = {
  ip: string
  persistedRequest: HocusPocusRequest
  socket: HocusPocusWebSocket
}

const SERVER_ID = process.env.SERVER_ID!

const redlock = new Redlock([getRedis()], {retryCount: 0})

export const hocusPocusHandler: WebSocketBehavior<HocusPocusSocketData> = {
  upgrade(res, req, context) {
    const headers: IncomingHttpHeaders = {}
    req.forEach((key, value) => {
      headers[key] = value
    })
    const ip =
      Buffer.from(res.getProxiedRemoteAddressAsText()).toString() ||
      Buffer.from(res.getRemoteAddressAsText()).toString()
    const persistedRequest = {
      method: req.getMethod(),
      url: req.getUrl(),
      query: req.getQuery(),
      headers,
      socket: {remoteAddress: ip}
    }
    res.upgrade<HocusPocusSocketData>(
      {
        ip,
        persistedRequest,
        socket: undefined as any
      },
      req.getHeader('sec-websocket-key'),
      new Uint8Array(),
      req.getHeader('sec-websocket-extensions'),
      context
    )
  },
  open(ws) {
    const userData = ws.getUserData()
    const socketId = userData.persistedRequest.headers['sec-websocket-key']!
    const hocusPocusWebSocket = yjsProxy.createOriginSocket(socketId, ws)
    userData.socket = hocusPocusWebSocket
    hocuspocus.handleConnection(hocusPocusWebSocket as any, userData.persistedRequest as any, {})
  },
  pong(ws, message) {
    ws.getUserData().socket.emit('pong', message)
  },
  async message(ws, message) {
    const tmpMsg = new IncomingMessage(message)
    const documentName = readVarString(tmpMsg.decoder)
    const loadedDoc = hocuspocus.documents.get(documentName)
    // uws detaches the arraybuffer when sync action completes, so clone first
    const messageBuffer = message.slice()
    if (loadedDoc) {
      ws.getUserData().socket.emit('message', messageBuffer)
      return
    }
    const redis = getRedis()
    const LOCK_DURATION = 10_000
    const LOCK_RENEWAL = LOCK_DURATION / 2
    try {
      // claim the document
      let lock = await redlock.acquire([`yjsLock:${documentName}`], LOCK_DURATION)
      // let everyone know we have it
      await redis.set(`yjsDoc:${documentName}`, SERVER_ID, 'PX', LOCK_DURATION)
      // handle the message
      ws.getUserData().socket.emit('message', messageBuffer)
      // renew the lock so if a server crashes another one can pick up the doc
      const intervalTimer = setInterval(async () => {
        const [newLock] = await Promise.all([
          lock.extend(LOCK_RENEWAL),
          redis.set(`yjsDoc:${documentName}`, SERVER_ID, 'PX', LOCK_DURATION)
        ])
        lock = newLock
      }, LOCK_RENEWAL)
      // release the document when no longer used
      yjsProxy.once(`unload:${documentName}`, async () => {
        clearInterval(intervalTimer)
        await Promise.all([lock.release(), redis.del(`yjsDoc:${documentName}`)])
      })
    } catch {
      // if this server can't lock the doc, send it to the server that owns it
      const proxyTo = await redis.get(`yjsDoc:${documentName}`)
      if (!proxyTo) {
        console.log('Could not achieve lock on YJS doc but no record exists in redis', documentName)
        return
      }
      const meta = {
        persistedRequest: ws.getUserData().persistedRequest,
        replyTo: `yjsProxy:${SERVER_ID}`,
        message,
        type: 'proxy'
      }
      const msg = pack(meta)
      redis.publish(`yjsProxy:${proxyTo}`, msg)
      return
    }
  },
  close(ws, code, message) {
    const socketId = ws.getUserData().persistedRequest.headers['sec-websocket-key']!
    yjsProxy.deleteOriginSocket(socketId)
    ws.getUserData().socket.emit('close', code, message)
  }
}
