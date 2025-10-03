import './hocusPocus'
import type {IncomingHttpHeaders} from 'node:http2'
import {hocuspocus} from './hocusPocus'
import './hocusPocus'
import type {WebSocketBehavior} from 'uWebSockets.js'
import {IncomingMessage} from '@hocuspocus/server'
import {readVarString} from 'lib0/decoding'
import {pack} from 'msgpackr'
import {HocusPocusWebSocket} from './HocusPocusWebSocket'
import getRedis from './utils/getRedis'
import {type YJSMessageUnload, yjsProxy} from './YJSProxy'

export type HocusPocusRequest = {
  method: string
  url: string
  headers: IncomingHttpHeaders
  socket: {remoteAddress: string}
}
type HocusPocusSocketData = {
  ip: string
  persistedRequest: HocusPocusRequest
  socket: HocusPocusWebSocket
}

const SERVER_ID = process.env.SERVER_ID!

export const hocusPocusHandler: WebSocketBehavior<HocusPocusSocketData> = {
  upgrade(res, req, context) {
    const headers: IncomingHttpHeaders = {}
    req.forEach((key, value) => {
      headers[key] = value
    })
    const ip =
      Buffer.from(res.getProxiedRemoteAddressAsText()).toString() ||
      Buffer.from(res.getRemoteAddressAsText()).toString()
    const pathname = req.getUrl()
    const query = req.getQuery()
    const persistedRequest = {
      method: req.getMethod(),
      url: query ? `${pathname}?${query}` : pathname,
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
    // uws detaches the arraybuffer when sync action completes, so clone first
    const messageBuffer = message.slice()
    const loadedDoc = hocuspocus.documents.has(documentName)
    const socketData = ws.getUserData()
    const {socket, persistedRequest} = socketData
    if (loadedDoc) {
      socket.emit('message', messageBuffer)
      return
    }

    const redis = getRedis()
    const LOCK_DURATION = 10_000
    const LOCK_RENEWAL = LOCK_DURATION / 2

    let pendingLock = yjsProxy.getPendingLock(documentName)
    const isFirstWithoutLock = !pendingLock
    if (isFirstWithoutLock) {
      // this is the very first claim request for this document by this server
      // OR the first claim request after the cached value was removed
      pendingLock = yjsProxy.setPendingLock(documentName, LOCK_DURATION)
    }

    const proxyTo = await pendingLock
    if (proxyTo && proxyTo !== SERVER_ID) {
      // another server owns the doc
      const meta = {
        persistedRequest,
        replyTo: `yjsProxy:${SERVER_ID}`,
        message: messageBuffer,
        type: 'proxy'
      }
      const msg = pack(meta)
      redis.publish(`yjsProxy:${proxyTo}`, msg)
      return
    }
    if (!proxyTo && isFirstWithoutLock) {
      // This message is the first one, it will manage the claim for doc
      // Renew the claim every 5 seconds
      const extendLock = setInterval(() => {
        redis.set(`yjsDoc:${documentName}`, SERVER_ID, 'PX', LOCK_DURATION)
      }, LOCK_RENEWAL)

      // End the claim when the doc is unloaded
      yjsProxy.once(`unload:${documentName}`, () => {
        clearInterval(extendLock)
        redis.del(`yjsDoc:${documentName}`)
        // broadcast to cluster to immediately remove the cached redis value
        const msg: YJSMessageUnload = {type: 'unload', documentName}
        redis.publish(`yjsProxy`, pack(msg))
      })
    }
    // Handle the message here
    socket.emit('message', messageBuffer)
  },
  close(ws, code, message) {
    const socketId = ws.getUserData().persistedRequest.headers['sec-websocket-key']!
    yjsProxy.deleteOriginSocket(socketId)
    ws.getUserData().socket.emit('close', code, message)
  }
}
