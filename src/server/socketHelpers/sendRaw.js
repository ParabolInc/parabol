const sendRaw = (transport, message) => {
  const transportType = transport.constructor.name
  switch (transportType) {
    case 'WebSocket':
      transport.send(message)
      break
    case 'ServerResponse':
      transport.write(`data: ${message}\n\n`)
  }
}

export default sendRaw
