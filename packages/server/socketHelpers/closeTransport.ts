import {UserWebSocket} from '../socketHelpers/ConnectionContext'
import http from 'http'
import sendSSEMessage from '../sse/sendSSEMessage'

const closeTransport = (
  transport: UserWebSocket | http.ServerResponse,
  code?: number,
  reason?: string
) => {
  switch (transport.constructor.name) {
    case 'WebSocket':
      ;(transport as UserWebSocket).close(code, reason)
      break
    case 'ServerResponse':
      const res = transport as http.ServerResponse
      if (!res.finished) {
        if (code || reason) {
          const msg = reason ? `${code}:${reason}` : String(code) || '401'
          sendSSEMessage(res, msg, 'close')
        }
        res.end()
      }
  }
}

export default closeTransport
