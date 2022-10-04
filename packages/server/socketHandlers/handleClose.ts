import {WebSocket} from 'uWebSockets.js'
import sendToSentry from '../utils/sendToSentry'
import handleDisconnect from './handleDisconnect'

const handleClose = (ws: WebSocket) => {
  if (!ws.connectionContext) return
  ws.done = true
  try {
    handleDisconnect(ws.connectionContext)
  } catch (e) {
    const error = e instanceof Error ? e : new Error('handleDisconnect failed')
    sendToSentry(error)
  }
}
export default handleClose
