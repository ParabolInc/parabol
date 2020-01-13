import {SHARED_COMPRESSOR, WebSocketBehavior} from 'uWebSockets.js'
import handleDisconnect from './socketHandlers/handleDisconnect'
import handleMessage from './socketHandlers/handleMessage'
import wssConnectionHandler from './socketHandlers/wssConnectionHandler'
import sendToSentry from './utils/sendToSentry'

const wsHandler: WebSocketBehavior = {
  compression: SHARED_COMPRESSOR,
  idleTimeout: 0,
  maxPayloadLength: 5 * 2 ** 20,
  open: wssConnectionHandler,
  message: handleMessage,
  // today, we don't send folks enough data to worry about backpressure
  close: (ws) => {
    if (!ws.connectionContext) return
    ws.done = true
    try {
      handleDisconnect(ws.connectionContext)
    } catch (e) {
      sendToSentry(e)
    }
  }
}

export default wsHandler
