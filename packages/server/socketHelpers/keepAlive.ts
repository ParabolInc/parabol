import {Times} from 'parabol-client/types/constEnums'
import handleDisconnect from '../socketHandlers/handleDisconnect'
import sendSSEMessage from '../sse/sendSSEMessage'
import ConnectionContext from './ConnectionContext'
import isHttpResponse from './isHttpResponse'

const PING = new Uint8Array([57])

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
    if (isHttpResponse(socket)) {
      sendSSEMessage(socket, 'ka', 'ka')
    } else if (!socket.getUserData().done) {
      socket.send(PING, true)
    }
  }, Times.WEBSOCKET_KEEP_ALIVE)
}

export default keepAlive
