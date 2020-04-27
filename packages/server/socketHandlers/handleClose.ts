import handleDisconnect from './handleDisconnect'
import sendToSentry from '../utils/sendToSentry'
import {WebSocket} from 'uWebSockets.js'

const handleClose = (ws: WebSocket) => {
  if (!ws.connectionContext) return
  ws.done = true
  try {
    handleDisconnect(ws.connectionContext)
  } catch (e) {
    sendToSentry(e)
  }
}
export default handleClose
