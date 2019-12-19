import executeGraphQL from '../graphql/executeGraphQL'
import closeTransport from '../socketHelpers/closeTransport'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import sseClients from '../sseClients'
import relayUnsubscribeAll from '../utils/relayUnsubscribeAll'
import closeWRTC from '../wrtc/signalServer/closeWRTC'

interface Options {
  exitCode?: number
  reason?: string
}
const query = `
mutation DisconnectSocket {
  disconnectSocket {
    user {
      id
    }
  }
}`

const handleDisconnect = (connectionContext: ConnectionContext, options: Options = {}) => {
  const {exitCode = 1000, reason} = options
  const {authToken, ip, cancelKeepAlive, id: socketId, socket} = connectionContext
  clearInterval(cancelKeepAlive!)
  relayUnsubscribeAll(connectionContext)
  closeWRTC(socket as any)
  executeGraphQL({authToken, ip, query, isPrivate: true, socketId})
  if (connectionContext.id.startsWith('sse')) {
    sseClients.delete(connectionContext.id)
  }
  if (!socket.done) {
    closeTransport(socket, exitCode, reason)
  }
}

export default handleDisconnect
