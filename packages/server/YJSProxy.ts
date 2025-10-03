import type {WebSocket} from 'uWebSockets.js'
import {pack, unpack} from 'msgpackr'
import {HocusPocusProxySocket} from './HocusPocusProxySocket'
import {HocusPocusWebSocket} from './HocusPocusWebSocket'
import {hocuspocus} from './hocusPocus'
import type {HocusPocusRequest} from './hocusPocusHandler'
import getRedis from './utils/getRedis'
import RedisInstance from './utils/RedisInstance'

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
class YJSProxy {
  private proxySockets: Record<string, {socket: HocusPocusProxySocket; cleanup: NodeJS.Timeout}> =
    {}
  private originSockets: Record<string, HocusPocusWebSocket> = {}
  private docWorkerIdPromises: Record<string, Promise<string | null>> = {}
  private locks: Record<string, NodeJS.Timeout> = {}
  private lockTTL: number
  private workerId: string
  constructor(options: {lockTTL: number; workerId: string}) {
    this.lockTTL = options.lockTTL
    this.workerId = options.workerId
  }
  listen() {
    const sub = new RedisInstance('yjsproxy')
    sub.subscribe('yjsProxy', `yjsProxy:${this.workerId}`)
    sub.on('messageBuffer', this.handleMessage)
  }
  private handleMessage = (_channel: Buffer, packedMessage: Buffer) => {
    const msg = unpack(packedMessage) as YJSMessage
    const {type} = msg
    if (type === 'proxy') {
      this.handleProxyMessage(msg)
      return
    }
    if (type === 'unload') {
      this.clearWorkerIdPromise(msg.documentName)
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

  async sendToProxy(
    documentName: string,
    persistedRequest: HocusPocusRequest,
    message: ArrayBufferLike
  ) {
    const proxyTo = await yjsProxy.getWorkerId(documentName)
    if (proxyTo && proxyTo !== this.workerId) {
      // another server owns the doc
      const meta = {
        persistedRequest,
        replyTo: `yjsProxy:${this.workerId}`,
        message,
        type: 'proxy'
      }
      const msg = pack(meta)
      getRedis().publish(`yjsProxy:${proxyTo}`, msg)
      return true
    }
    return false
  }
  getWorkerId(documentName: string) {
    const existingWorkerIdPromise = this.docWorkerIdPromises[documentName]
    if (existingWorkerIdPromise) return existingWorkerIdPromise
    // this is the very first claim request for this document by this server
    // OR the first claim request after the cached value was removed
    return yjsProxy.setWorkerId(documentName)
  }
  private setWorkerId(documentName: string) {
    const workerIdPromise = getRedis().set(
      `yjsDoc:${documentName}`,
      this.workerId,
      'PX',
      this.lockTTL,
      'NX',
      'GET'
    )
    this.docWorkerIdPromises[documentName] = workerIdPromise
    // if a remote server unloads the doc, it sends an unload message to clear this cached value
    // if the remote server crashes, the `proxyTo` value will be stale for up to this.lockTTL
    setTimeout(() => {
      this.clearWorkerIdPromise(documentName)
    }, this.lockTTL / 2)
    return workerIdPromise
  }

  maintainLock(documentName: string) {
    this.locks[documentName] = setInterval(() => {
      getRedis().set(`yjsDoc:${documentName}`, this.workerId, 'PX', this.lockTTL)
    }, this.lockTTL / 2)
  }

  releaseLock(documentName: string) {
    const redis = getRedis()
    clearInterval(this.locks[documentName])
    delete this.locks[documentName]
    // broadcast to cluster to immediately remove the cached redis value
    redis.del(`yjsDoc:${documentName}`)
    const msg: YJSMessageUnload = {type: 'unload', documentName}
    redis.publish(`yjsProxy`, pack(msg))
  }
  private clearWorkerIdPromise(documentName: string) {
    delete this.docWorkerIdPromises[documentName]
  }
  createOriginSocket(socketId: string, ws: WebSocket<any>) {
    const socket = new HocusPocusWebSocket(ws)
    this.originSockets[socketId] = socket
    return socket
  }

  deleteOriginSocket(socketId: string) {
    delete this.originSockets[socketId]
  }
  private handleProxyMessage(msg: any) {
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

export const yjsProxy = new YJSProxy({lockTTL: 10_000, workerId: process.env.SERVER_ID!})
