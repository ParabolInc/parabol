import {WebSocket} from 'uWebSockets.js'
import sendToSentry from '../utils/sendToSentry'
import handleDisconnect from './handleDisconnect'
import {SocketUserData} from './handleOpen'

const handleClose = (ws: WebSocket<SocketUserData>) => {
  const userData = ws.getUserData()
  const {connectionContext} = userData
  if (!connectionContext) return
  userData.done = true
  try {
    handleDisconnect(connectionContext)
  } catch (e) {
    const error = e instanceof Error ? e : new Error('handleDisconnect failed')
    sendToSentry(error)
  }
}
export default handleClose
