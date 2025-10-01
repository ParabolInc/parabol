import type {WebSocket} from 'uWebSockets.js'
import {EventEmitter} from 'tseep'

// This is a mock WebSocket that fills as much of the standard WebSocket contract that HocusPocus requires
export class HocusPocusWebSocket extends EventEmitter {
  private ws: WebSocket<any>
  readyState = 1
  remoteAddress: string
  constructor(ws: WebSocket<any>, ip: string) {
    super()
    this.ws = ws
    this.remoteAddress = ip
    this.on('close', () => {
      this.readyState = 3
    })
  }
  close(code?: number, reason?: string) {
    this.ws.end(code, reason)
  }
  ping() {
    this.ws.ping()
  }
  send(message: Uint8Array) {
    this.ws.send(message, true)
  }
}
