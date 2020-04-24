import {HttpResponse, WebSocket} from 'uWebSockets.js'
import sendSSEMessage from '../sse/sendSSEMessage'
import isHttpResponse from './isHttpResponse'

const closeTransport = (transport: WebSocket | HttpResponse, code?: number, reason?: string) => {
  if (transport.done) return
  if (isHttpResponse(transport)) {
    if (code || reason) {
      const msg = reason ? `${code}:${reason}` : String(code) || '401'
      sendSSEMessage(transport, msg, 'close')
    }
    transport.end()
    return
  }
  transport.end(code, reason)
}

export default closeTransport
