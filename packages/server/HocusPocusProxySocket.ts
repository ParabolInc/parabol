import {pack} from 'msgpackr'
import {EventEmitter} from 'tseep'
import getRedis from './utils/getRedis'
import type {YJSMessageClose, YJSMessagePing, YJSMessageSend} from './YJSProxy'

export class HocusPocusProxySocket extends EventEmitter {
  private replyTo: string
  private socketId: string
  readyState = 1
  constructor(replyTo: string, socketId: string) {
    super()
    this.replyTo = replyTo
    this.socketId = socketId
    this.on('close', () => {
      this.readyState = 3
    })
  }
  private publish(msg: YJSMessageClose | YJSMessagePing | YJSMessageSend) {
    getRedis().publish(this.replyTo, pack(msg))
  }
  close(code?: number, reason?: string) {
    const msg: YJSMessageClose = {type: 'close', code, reason, socketId: this.socketId}
    this.publish(msg)
  }
  ping() {
    const msg: YJSMessagePing = {type: 'ping', socketId: this.socketId}
    this.publish(msg)
  }
  send(message: Uint8Array) {
    const msg: YJSMessageSend = {type: 'send', socketId: this.socketId, message}
    this.publish(msg)
  }
}
