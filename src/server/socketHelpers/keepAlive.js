import handleDisconnect from 'server/socketHandlers/handleDisconnect'
import sendRaw from 'server/socketHelpers/sendRaw'
import {Events} from '@mattkrick/trebuchet-client'

const keepAlive = (connectionContext, timeout) => {
  connectionContext.cancelKeepAlive = setInterval(() => {
    const {socket} = connectionContext
    if (connectionContext.isAlive === false) {
      handleDisconnect(connectionContext)()
    } else {
      connectionContext.isAlive = false
      // TODO record time sent so when we get a message we can calc latency
      sendRaw(socket, Events.KEEP_ALIVE)
    }
  }, timeout)
}

export default keepAlive
