const closeTransport = (transport, code) => {
  const transportType = transport.constructor.name
  switch (transportType) {
    case 'WebSocket':
      transport.close(code)
      break
    case 'ServerResponse':
      if (!transport.finished) transport.end()
  }
}

export default closeTransport
