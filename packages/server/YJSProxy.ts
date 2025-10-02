import type {WebSocket} from 'uWebSockets.js'
import {unpack} from 'msgpackr'
import {EventEmitter} from 'tseep'
import {HocusPocusProxySocket} from './HocusPocusProxySocket'
import {HocusPocusWebSocket} from './HocusPocusWebSocket'
import {hocuspocus} from './hocusPocus'
import RedisInstance from './utils/RedisInstance'

const {SERVER_ID} = process.env
class YJSProxy extends EventEmitter {
  proxySockets: Record<string, {socket: HocusPocusProxySocket; cleanup: NodeJS.Timeout}> = {}
  originSockets: Record<string, HocusPocusWebSocket> = {}
  listen() {
    const sub = new RedisInstance('yjsproxy')
    sub.subscribe(`yjsProxy:${SERVER_ID}`)
    sub.on('messageBuffer', this.handleMessage)
  }
  handleMessage = (_channel: Buffer, packedMessage: Buffer) => {
    const msg = unpack(packedMessage)
    const {type} = msg
    if (type === 'proxy') {
      this.handleProxyMessage(msg)
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
