import {Times} from 'parabol-client/types/constEnums'
import handleDisconnect from '../socketHandlers/handleDisconnect'
import ConnectionContext from './ConnectionContext'

const keepAlive = (connectionContext: ConnectionContext) => {
  connectionContext.isAlive = true
  clearInterval(connectionContext.cancelKeepAlive!)
  connectionContext.cancelKeepAlive = setInterval(() => {
    if (connectionContext.isAlive === false) {
      handleDisconnect(connectionContext)
    } else {
      connectionContext.isAlive = false
    }
    const {socket} = connectionContext
    socket.keepAlive()
  }, Times.WEBSOCKET_KEEP_ALIVE)
}

export default keepAlive
