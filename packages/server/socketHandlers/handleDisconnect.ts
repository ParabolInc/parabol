import relayUnsubscribeAll from 'server/utils/relayUnsubscribeAll'
import wsGraphQLHandler from 'server/socketHandlers/wsGraphQLHandler'
import closeTransport from 'server/socketHelpers/closeTransport'
import closeWRTC from 'server/wrtc/signalServer/closeWRTC'
import ConnectionContext from 'server/socketHelpers/ConnectionContext'
import {UWebSocket} from 'server/wrtc/signalServer/handleSignal'

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
