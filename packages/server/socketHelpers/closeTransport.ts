import ConnectionContext from './ConnectionContext'

const closeTransport = (
  connectionContext: ConnectionContext,
  code?: number,
  reason?: string
) => {
  const {socket} = connectionContext
  socket.closeTransport(code, reason)
}

export default closeTransport
