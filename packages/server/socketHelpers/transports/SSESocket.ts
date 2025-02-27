import {HttpResponse} from 'uWebSockets.js'
import {Socket} from './Socket'
import sendSSEMessage from '../../sse/sendSSEMessage'

export type TransportType = HttpResponse
export class SSESocket implements Socket {
  prefix = 'sse'

  transport: TransportType

  constructor(transport: HttpResponse) {
    this.transport = transport
  }

  done() {
    return this.transport.done
  }

  sendEncodedMessage(message: string) {
    if (this.done()) return
    sendSSEMessage(this.transport, message)
  }

  keepAlive() {
    sendSSEMessage(this.transport, 'ka', 'ka')
  }

  closeTransport(code?: number, reason?: string) {
    if (this.done()) return
    if (code || reason) {
      const msg = reason ? `${code}:${reason}` : String(code) || '401'
      sendSSEMessage(this.transport, msg, 'close')
    }
    this.transport.end()
 
  }
}
