import executeGraphQL from '../graphql/executeGraphQL'
import closeTransport from '../socketHelpers/closeTransport'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import relayUnsubscribeAll from '../utils/relayUnsubscribeAll'
import closeWRTC from '../wrtc/signalServer/closeWRTC'
import sseClients from '../sseClients'
import sleep from 'parabol-client/utils/sleep'

interface Options {
  exitCode?: number
  reason?: string
  isClosed?: boolean
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
  const {exitCode = 1000, reason, isClosed} = options
  const {authToken, ip, cancelKeepAlive, id: socketId, socket} = connectionContext
  clearInterval(cancelKeepAlive!)
  connectionContext.isAlive = false
  relayUnsubscribeAll(connectionContext)
  closeWRTC(socket as any)
  executeGraphQL({authToken, ip, query, isPrivate: true, socketId})
  if (connectionContext.id.startsWith('sse')) {
    sseClients.delete(connectionContext.id)
  }
  if (!isClosed) {
    closeTransport(socket, exitCode, reason)
  }
}

export default handleDisconnect
