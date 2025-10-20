import type {WebSocket} from 'uWebSockets.js'
import {EventEmitter} from 'tseep'

// This is a mock WebSocket that fills as much of the standard WebSocket contract that HocusPocus requires
export class HocusPocusWebSocket extends EventEmitter {
  private ws: WebSocket<any>
  readyState = 1
  constructor(ws: WebSocket<any>) {
    super()
    this.ws = ws
    this.on('close', () => {
      this.readyState = 3
    })
  }
  close(code?: number, reason?: string) {
    if (this.readyState !== 1) return
    this.readyState = 3
    this.emit('close', code, reason)
    this.ws.end(code, reason)
  }
  ping() {
    if (this.readyState !== 1) return
    this.ws.ping()
  }
  send(message: Uint8Array) {
    if (this.readyState !== 1) return
    this.ws.send(message, true)
  }
}
