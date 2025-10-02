import {pack} from 'msgpackr'
import {EventEmitter} from 'tseep'
import getRedis from './utils/getRedis'

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
  close(code?: number, reason?: string) {
    const msg = pack({type: 'close', code, reason, socketId: this.socketId})
    getRedis().publish(this.replyTo, msg)
  }
  ping() {
    const msg = pack({type: 'ping', socketId: this.socketId})
    getRedis().publish(this.replyTo, msg)
  }
  send(message: Uint8Array) {
    const msg = pack({type: 'send', socketId: this.socketId, message})
    getRedis().publish(this.replyTo, msg)
  }
}
