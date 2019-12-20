import {Events} from '@mattkrick/trebuchet-client'
import http from 'http'
import {WebSocket} from '@clusterws/cws'

const sendRaw = (transport: WebSocket | http.ServerResponse, message) => {
  const transportType = transport.constructor.name
  switch (transportType) {
    case 'WebSocket':
      ;(transport as WebSocket).send(message)
      break
    case 'ServerResponse':
      const sseTransport = transport as http.ServerResponse
      if (!sseTransport.finished) {
        if (message === Events.KEEP_ALIVE) {
          sseTransport.write('event: ka\n')
        }
        sseTransport.write(`data: ${message}\n\n`)
        ;(sseTransport as any).flushHeaders()
      }
  }
}

export default sendRaw
