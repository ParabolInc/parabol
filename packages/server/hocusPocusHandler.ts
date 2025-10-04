import './hocusPocus'
import type {IncomingHttpHeaders} from 'node:http2'
import {hocuspocus} from './hocusPocus'
import './hocusPocus'
import type {WebSocketBehavior} from 'uWebSockets.js'
import {IncomingMessage} from '@hocuspocus/server'
import {readVarString} from 'lib0/decoding'
import {HocusPocusWebSocket} from './HocusPocusWebSocket'
import {yjsProxy} from './YJSProxy'

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
    const handled = await yjsProxy.sendToProxy(documentName, persistedRequest, messageBuffer)
    if (!handled) {
      // This worker owns the document, but hocuspocus hasn't loaded it yet
      socket.emit('message', messageBuffer)
    }
  },
  close(ws, code, message) {
    const socketId = ws.getUserData().persistedRequest.headers['sec-websocket-key']!
    yjsProxy.deleteOriginSocket(socketId)
    ws.getUserData().socket.emit('close', code, message)
  }
}
