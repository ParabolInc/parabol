import {UserWebSocket} from '../socketHelpers/ConnectionContext'
import http from 'http'

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
          res.write(`event: close\n`)
          res.write(`data: ${code}:${reason}\n\n`)
          ;(res as any).flushHeaders()
        }
        res.end()
      }
  }
}

export default closeTransport
