import relayUnsubscribeAll from '../utils/relayUnsubscribeAll'
import wsGraphQLHandler from './wsGraphQLHandler'
import closeTransport from '../socketHelpers/closeTransport'
import closeWRTC from '../wrtc/signalServer/closeWRTC'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import {UWebSocket} from '../wrtc/signalServer/handleSignal'

interface Options {
  exitCode?: number
}
const handleDisconnect = (connectionContext: ConnectionContext, options: Options = {}) => () => {
  const {exitCode = 1000} = options
  const payload = {
    query: `
    mutation DisconnectSocket {
      disconnectSocket {
        user {
          id
        }
      }
    }
  `
  }
  relayUnsubscribeAll(connectionContext)
  const {cancelKeepAlive, socket} = connectionContext
  closeTransport(socket, exitCode)
  clearInterval(cancelKeepAlive!)
  closeWRTC(socket as UWebSocket)
  wsGraphQLHandler(connectionContext, payload).catch(console.error)
}

export default handleDisconnect
