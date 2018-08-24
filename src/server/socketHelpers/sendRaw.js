import {Events} from '@mattkrick/trebuchet-client'

const sendRaw = (transport, message) => {
  const transportType = transport.constructor.name
  switch (transportType) {
    case 'WebSocket':
      transport.send(message)
      break
    case 'ServerResponse':
      if (!transport.finished) {
        if (message === Events.KEEP_ALIVE) {
          transport.write('event: ka\n')
        }
        transport.write(`data: ${message}\n\n`)
        transport.flush()
      }
  }
}

export default sendRaw
