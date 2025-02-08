import {type WebSocketBehavior} from 'uWebSockets.js'
import sendToSentry from '../utils/sendToSentry'
import handleDisconnect from './handleDisconnect'
import {SocketUserData} from './handleOpen'

const handleClose: WebSocketBehavior<SocketUserData>['close'] = (ws, code, message) => {
  const userData = ws.getUserData()
  const {connectionContext} = userData
  if (!connectionContext) return
  userData.done = true
  try {
    console.log(
      'handleClose handleDisconnect',
      connectionContext.id,
      code,
      Buffer.from(message).toString('utf-8')
    )
    handleDisconnect(connectionContext)
  } catch (e) {
    const error = e instanceof Error ? e : new Error('handleDisconnect failed')
    sendToSentry(error)
  }
}
export default handleClose
