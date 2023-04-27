import closeTransport from '../socketHelpers/closeTransport'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import sseClients from '../sseClients'
import {getUserId} from '../utils/authorization'
import publishInternalGQL from '../utils/publishInternalGQL'
import relayUnsubscribeAll from '../utils/relayUnsubscribeAll'

interface Options {
  exitCode?: number
  reason?: string
}
export const disconnectQuery = `
mutation DisconnectSocket($userId: ID!) {
  disconnectSocket(userId: $userId) {
    user {
      id
    }
  }
}`

const handleDisconnect = (connectionContext: ConnectionContext, options: Options = {}) => {
  const {exitCode = 1000, reason} = options
  const {authToken, ip, cancelKeepAlive, id: socketId, socket, isDisconnecting} = connectionContext
  if (isDisconnecting) return
  connectionContext.isDisconnecting = true
  // check if isClosing & if isClosing bail
  clearInterval(cancelKeepAlive!)
  relayUnsubscribeAll(connectionContext)
  if (authToken.rol !== 'impersonate') {
    const userId = getUserId(authToken)
    publishInternalGQL({authToken, ip, query: disconnectQuery, socketId, variables: {userId}})
  }
  if (connectionContext.id.startsWith('sse')) {
    sseClients.delete(connectionContext.id)
  }
  closeTransport(socket, exitCode, reason)
}

export default handleDisconnect
