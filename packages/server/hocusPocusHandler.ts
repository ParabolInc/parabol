import './hocusPocus'
import type {WebSocketBehavior} from 'uWebSockets.js'
import {HocusPocusWebSocket} from './HocusPocusWebSocket'
import {redisHocusPocus} from './hocusPocus'
import type {SerializedHTTPRequest} from './utils/tiptap/RedisServerAffinity'

export type HocusPocusSocketData = {
  ip: string
  serializedHTTPRequest: SerializedHTTPRequest
  socket: HocusPocusWebSocket
  closed?: true
}

export const hocusPocusHandler: WebSocketBehavior<HocusPocusSocketData> = {
  maxPayloadLength: 1024 * 1024 * 64,
  upgrade(res, req, context) {
    const headers = {} as SerializedHTTPRequest['headers']
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
  async message(ws, message, isBinary) {
    if (!isBinary) return
    const {serializedHTTPRequest} = ws.getUserData()
    redisHocusPocus.onSocketMessage(serializedHTTPRequest, message)
  },
  close(ws, code, reason) {
    const userData = ws.getUserData()
    userData.closed = true
    userData.socket.readyState = 3
    const socketId = userData.serializedHTTPRequest.headers['sec-websocket-key']!
    redisHocusPocus.onSocketClose(socketId, code, reason)
  }
}
