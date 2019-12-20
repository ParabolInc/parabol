import closeTransport from '../socketHelpers/closeTransport'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import relayUnsubscribeAll from '../utils/relayUnsubscribeAll'
import closeWRTC from '../wrtc/signalServer/closeWRTC'
import {UWebSocket} from '../wrtc/signalServer/handleSignal'
import executeGraphQL from '../graphql/executeGraphQL'

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

const handleDisconnect = (connectionContext: ConnectionContext, options: Options = {}) => () => {
  const {exitCode = 1000, reason} = options
  relayUnsubscribeAll(connectionContext)
  const {authToken, ip, cancelKeepAlive, socket, id: socketId} = connectionContext
  closeTransport(socket, exitCode, reason)
  clearInterval(cancelKeepAlive!)
  closeWRTC(socket as UWebSocket)
  executeGraphQL({authToken, ip, query, isPrivate: true, socketId})
}

export default handleDisconnect
