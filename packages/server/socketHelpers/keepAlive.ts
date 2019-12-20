import {ServerResponse} from 'http'
import {Times} from 'parabol-client/types/constEnums'
import handleDisconnect from '../socketHandlers/handleDisconnect'
import sendSSEMessage from '../sse/sendSSEMessage'
import ConnectionContext from './ConnectionContext'

const isSSE = (socketOrRes: unknown): socketOrRes is ServerResponse => {
  return 'statusCode' in (socketOrRes as ServerResponse)
}

const keepAlive = (connectionContext: ConnectionContext) => {
  connectionContext.isAlive = true
  clearInterval(connectionContext.cancelKeepAlive!)
  connectionContext.cancelKeepAlive = setInterval(() => {
    if (connectionContext.isAlive === false) {
      handleDisconnect(connectionContext)()
    } else {
      connectionContext.isAlive = false
    }
    const {socket} = connectionContext
    if (isSSE(socket)) {
      sendSSEMessage(socket, 'ka', 'ka')
    }
  }, Times.WEBSOCKET_KEEP_ALIVE)
}

export default keepAlive
