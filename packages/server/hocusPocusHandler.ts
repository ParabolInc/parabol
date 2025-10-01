import './hocusPocus'
import type {IncomingHttpHeaders} from 'node:http2'
import type {UpgradeData} from 'graphql-ws/use/uWebSockets'
import {hocuspocus} from './hocusPocus'
import './hocusPocus'
import type {WebSocketBehavior} from 'uWebSockets.js'
import {HocusPocusWebSocket} from './HocusPocusWebSocket'

type HocusPocusRequest = UpgradeData['persistedRequest'] & {socket: HocusPocusWebSocket}
type HocusPocusSocketData = {
  ip: string
  persistedRequest: HocusPocusRequest
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

    res.upgrade<HocusPocusSocketData>(
      {
        ip,
        persistedRequest: {
          method: req.getMethod(),
          url: req.getUrl(),
          query: req.getQuery(),
          headers,
          socket: undefined as any
        }
      },
      req.getHeader('sec-websocket-key'),
      new Uint8Array(),
      req.getHeader('sec-websocket-extensions'),
      context
    )
  },
  open(ws) {
    const userData = ws.getUserData()
    const hocusPocusWebSocket = new HocusPocusWebSocket(ws, userData.ip)
    userData.persistedRequest.socket = hocusPocusWebSocket
    hocuspocus.handleConnection(hocusPocusWebSocket as any, userData.persistedRequest as any, {})
  },
  pong(ws, message) {
    ws.getUserData().persistedRequest.socket.emit('pong', message)
  },
  message(ws, message) {
    // hocuspocus message handler is (needlessly) async and uws detaches the arraybuffer
    // before await gets called so we have to clone the entire buffer first
    ws.getUserData().persistedRequest.socket.emit('message', message.slice())
  },
  close(ws, code, message) {
    ws.getUserData().persistedRequest.socket.emit('close', code, message)
  }
}
