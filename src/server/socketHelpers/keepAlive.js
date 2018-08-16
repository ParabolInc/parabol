import handleDisconnect from 'server/socketHandlers/handleDisconnect'
import {GQL_CONNECTION_KEEP_ALIVE} from 'universal/utils/constants'
import sendRaw from 'server/socketHelpers/sendRaw'

const keepAlive = (connectionContext, timeout) => {
  connectionContext.cancelKeepAlive = setInterval(() => {
    const {socket} = connectionContext
    if (connectionContext.isAlive === false) {
      handleDisconnect(connectionContext)()
    } else {
      connectionContext.isAlive = false
      // TODO record time sent so when we get a message we can calc latency
      sendRaw(socket, GQL_CONNECTION_KEEP_ALIVE)
    }
  }, timeout)
}

export default keepAlive
