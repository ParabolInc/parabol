import {WebSocket as uWebSocket} from 'uWebSockets.js'
import {Socket} from './Socket'
import {SocketUserData} from '../../socketHandlers/handleOpen'

const PING = new Uint8Array([57])
const ESTIMATED_MTU = 1400

export type TransportType = uWebSocket<SocketUserData>
export class WebSocket implements Socket {
  prefix = 'ws'

  transport: TransportType

  constructor(transport: TransportType) {
    this.transport = transport
  }

  done() {
    return !!this.transport.getUserData().done
  }

  sendEncodedMessage(message: string) {
    if (this.done()) return
    this.transport.send(message, false, message.length > ESTIMATED_MTU)
  }

  keepAlive() {
    if (!this.done()) {
      this.transport.send(PING, true)
    }
  }

  closeTransport(code?: number, reason?: string) {
    if (this.done()) return
    this.transport.end(code, reason)
  }
}
