import './hocusPocus'
import type {WebSocketBehavior} from 'uWebSockets.js'
import {HocusPocusWebSocket} from './HocusPocusWebSocket'
import {redisHocusPocus} from './hocusPocus'
import {Logger} from './utils/Logger'
import parseSessionId from './utils/parseSessionId'
import {runWithLogContext} from './utils/requestLogContext'
import type {SerializedHTTPRequest} from './utils/tiptap/RedisServerAffinity'

export type HocusPocusSocketData = {
  ip: string
  sessionId?: string
  serializedHTTPRequest: SerializedHTTPRequest
  socket: HocusPocusWebSocket
  closed?: true
}

const getSocketLogContext = ({ip, sessionId}: HocusPocusSocketData) => ({
  ip,
  sessionId,
  component: 'yjs'
})

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
      socket: {remoteAddress: ip},
      connectedAt: Date.now()
    }
    res.upgrade<HocusPocusSocketData>(
      {
        ip,
        sessionId: parseSessionId(new URLSearchParams(query).get('sessionId')),
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
    runWithLogContext(getSocketLogContext(userData), () => {
      try {
        redisHocusPocus.onSocketOpen(userData.socket, userData.serializedHTTPRequest)
      } catch (e) {
        Logger.error('hocusPocusHandler: failed to open socket', e, {ip: userData.ip})
        userData.socket.close(1011)
      }
    })
  },
  async message(ws, message, isBinary) {
    if (!isBinary) return
    const userData = ws.getUserData()
    await runWithLogContext(getSocketLogContext(userData), async () => {
      try {
        await redisHocusPocus.onSocketMessage(userData.serializedHTTPRequest, message)
      } catch (e) {
        Logger.error('hocusPocusHandler: failed to handle message', e, {ip: userData.ip})
        userData.socket.close(1011)
      }
    })
  },
  close(ws, code, reason) {
    const userData = ws.getUserData()
    userData.closed = true
    userData.socket.readyState = 3
    const socketId = userData.serializedHTTPRequest.headers['sec-websocket-key']
    runWithLogContext(getSocketLogContext(userData), () => {
      try {
        redisHocusPocus.onSocketClose(socketId, code, reason)
      } catch (e) {
        Logger.error('hocusPocusHandler: failed to close socket', e, {ip: userData.ip})
      }
    })
  }
}
