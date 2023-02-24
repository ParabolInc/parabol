import {HttpResponse, WebSocket} from 'uWebSockets.js'
import {SocketUserData} from '../socketHandlers/handleOpen'
import sendSSEMessage from '../sse/sendSSEMessage'
import isHttpResponse from './isHttpResponse'

const closeTransport = (
  transport: WebSocket<SocketUserData> | HttpResponse,
  code?: number,
  reason?: string
) => {
  if (isHttpResponse(transport)) {
    if (transport.done) return
    if (code || reason) {
      const msg = reason ? `${code}:${reason}` : String(code) || '401'
      sendSSEMessage(transport, msg, 'close')
    }
    transport.end()
    return
  }
  if (transport.getUserData().done) return
  transport.end(code, reason)
}

export default closeTransport
