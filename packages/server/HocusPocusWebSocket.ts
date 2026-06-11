import type {WebSocket} from 'uWebSockets.js'
import type {WebSocketLike} from '@hocuspocus/server'
import type {HocusPocusSocketData} from './hocusPocusHandler'
import {Logger} from './utils/Logger'

// This is a mock WebSocket that fills as much of the standard WebSocket contract that HocusPocus requires
export class HocusPocusWebSocket implements WebSocketLike {
  private ws: WebSocket<HocusPocusSocketData>
  readyState = 1
  constructor(ws: WebSocket<HocusPocusSocketData>) {
    this.ws = ws
  }
  close(code?: number, reason?: string) {
    if (this.ws.getUserData().closed) return
    this.readyState = 3
    try {
      this.ws.end(code, reason)
    } catch (e) {
      Logger.error({closed: this.ws.getUserData().closed, readyState: this.readyState})
      Logger.error(e)
    }
  }
  send(message: Uint8Array) {
    if (this.ws.getUserData().closed) return
    try {
      this.ws.send(message, true)
    } catch (e) {
      Logger.error({closed: this.ws.getUserData().closed, readyState: this.readyState})
      Logger.error(e)
    }
  }
}
