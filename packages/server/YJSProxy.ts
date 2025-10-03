import type {WebSocket} from 'uWebSockets.js'
import {unpack} from 'msgpackr'
import {EventEmitter} from 'tseep'
import {HocusPocusProxySocket} from './HocusPocusProxySocket'
import {HocusPocusWebSocket} from './HocusPocusWebSocket'
import {hocuspocus} from './hocusPocus'
import type {HocusPocusRequest} from './hocusPocusHandler'
import getRedis from './utils/getRedis'
import RedisInstance from './utils/RedisInstance'

const SERVER_ID = process.env.SERVER_ID!

export type YJSMessageProxy = {
  type: 'proxy'
  replyTo: string
  message: Uint8Array<ArrayBufferLike>
  persistedRequest: HocusPocusRequest
}

export type YJSMessageUnload = {
  type: 'unload'
  documentName: string
}

export type YJSMessageClose = {
  type: 'close'
  code?: number
  reason?: string
  socketId: string
}

export type YJSMessagePing = {
  type: 'ping'
  socketId: string
}

export type YJSMessageSend = {
  type: 'send'
  message: Uint8Array<ArrayBufferLike>
  socketId: string
}
type YJSMessage =
  | YJSMessageProxy
  | YJSMessageUnload
  | YJSMessageClose
  | YJSMessagePing
  | YJSMessageSend
class YJSProxy extends EventEmitter {
  private proxySockets: Record<string, {socket: HocusPocusProxySocket; cleanup: NodeJS.Timeout}> =
    {}
  private originSockets: Record<string, HocusPocusWebSocket> = {}
  private pendingLocks: Record<string, Promise<string | null>> = {}
  listen() {
    const sub = new RedisInstance('yjsproxy')
    sub.subscribe('yjsProxy', `yjsProxy:${SERVER_ID}`)
    sub.on('messageBuffer', this.handleMessage)
  }
  handleMessage = (_channel: Buffer, packedMessage: Buffer) => {
    const msg = unpack(packedMessage) as YJSMessage
    const {type} = msg
    if (type === 'proxy') {
      this.handleProxyMessage(msg)
      return
    }
    if (type === 'unload') {
      this.clearPendingLock(msg.documentName)
      return
    }
    const {socketId} = msg
    const socket = this.originSockets[socketId]
    if (!socket) {
      // origin socket already cleaned up
      return
    }
    if (type === 'close') {
      socket.close(msg.code, msg.reason)
    } else if (type === 'ping') {
      socket.ping()
    } else if (type === 'send') {
      socket.send(msg.message)
    }
  }
  getPendingLock(documentName: string) {
    return this.pendingLocks[documentName]
  }
  setPendingLock(documentName: string, ttl: number) {
    const pendingLock = getRedis().set(`yjsDoc:${documentName}`, SERVER_ID, 'PX', ttl, 'NX', 'GET')
    this.pendingLocks[documentName] = pendingLock
    // if a remote server unloads the doc, it sends an unload message to clear this cached value
    // if the remote server crashes, the `proxyTo` value will be stale for up to ttl
    setTimeout(() => {
      this.clearPendingLock(documentName)
    }, ttl / 2)
    return pendingLock
  }
  clearPendingLock(documentName: string) {
    delete this.pendingLocks[documentName]
  }
  createOriginSocket(socketId: string, ws: WebSocket<any>) {
    const socket = new HocusPocusWebSocket(ws)
    this.originSockets[socketId] = socket
    return socket
  }

  deleteOriginSocket(socketId: string) {
    delete this.originSockets[socketId]
  }
  handleProxyMessage(msg: any) {
    const {replyTo, message, persistedRequest} = msg
    const {headers} = persistedRequest
    const socketId = headers['sec-websocket-key']!
    let socketRecord = this.proxySockets[socketId]
    const cleanup = setTimeout(() => {
      delete this.proxySockets[socketId]
    }, 30000)
    if (!socketRecord) {
      const socket = new HocusPocusProxySocket(replyTo, socketId)
      socketRecord = {socket, cleanup}
      this.proxySockets[socketId] = socketRecord
      hocuspocus.handleConnection(socket as any, persistedRequest as any, {})
    } else {
      clearTimeout(socketRecord.cleanup)
      socketRecord.cleanup = cleanup
    }
    socketRecord.socket.emit('message', message)
  }
}

export const yjsProxy = new YJSProxy()
