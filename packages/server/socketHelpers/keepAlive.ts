import handleDisconnect from '../socketHandlers/handleDisconnect'
import sendRaw from './sendRaw'
import {Events} from '@mattkrick/trebuchet-client'

const WS_KEEP_ALIVE = 10000
const keepAlive = (connectionContext) => {
  connectionContext.isAlive = true
  clearInterval(connectionContext.cancelKeepAlive)
  connectionContext.cancelKeepAlive = setInterval(() => {
    const {socket} = connectionContext
    if (connectionContext.isAlive === false) {
      handleDisconnect(connectionContext)()
    } else {
      connectionContext.isAlive = false
      // TODO record time sent so when we get a message we can calc latency
      sendRaw(socket, Events.KEEP_ALIVE)
    }
  }, WS_KEEP_ALIVE)
}

export default keepAlive
