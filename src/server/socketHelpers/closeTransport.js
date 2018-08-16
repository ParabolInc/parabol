const closeTransport = (transport, code) => {
  const transportType = transport.constructor.name
  switch (transportType) {
    case 'WebSocket':
      transport.close(code)
      break
    case 'ServerResponse':
      transport.writeHead(404)
      transport.end()
  }
}

export default closeTransport
