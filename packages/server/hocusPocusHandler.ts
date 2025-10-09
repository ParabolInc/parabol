import './hocusPocus'
import type {IncomingHttpHeaders} from 'node:http2'
import {redisHocusPocus} from './hocusPocus'
import './hocusPocus'
import type {WebSocketBehavior} from 'uWebSockets.js'
import {HocusPocusWebSocket} from './HocusPocusWebSocket'
import type {SerializedHTTPRequest} from './utils/tiptap/RedisServerAffinity'

type HocusPocusSocketData = {
  ip: string
  serializedHTTPRequest: SerializedHTTPRequest
  socket: HocusPocusWebSocket
}

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
    const serializedHTTPRequest = {
      method: req.getMethod(),
      url: query ? `${pathname}?${query}` : pathname,
      headers,
      socket: {remoteAddress: ip}
    }
    res.upgrade<HocusPocusSocketData>(
      {
        ip,
        serializedHTTPRequest,
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
    userData.socket = new HocusPocusWebSocket(ws)
    redisHocusPocus.onSocketOpen(userData.socket, userData.serializedHTTPRequest)
  },
  pong(ws, message) {
    ws.getUserData().socket.emit('pong', message)
  },
  async message(ws, message) {
    const socketData = ws.getUserData()
    const {socket, serializedHTTPRequest} = socketData
    redisHocusPocus.onSocketMessage(socket, serializedHTTPRequest, message)
  },
  close(ws, code, reason) {
    const socketId = ws.getUserData().serializedHTTPRequest.headers['sec-websocket-key']!
    redisHocusPocus.onSocketClose(socketId, code, reason)
  }
}
