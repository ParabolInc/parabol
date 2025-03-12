import {type WebSocketBehavior} from 'uWebSockets.js'
import handleDisconnect from './handleDisconnect'
import {SocketUserData} from './handleOpen'

const handleClose: WebSocketBehavior<SocketUserData>['close'] = (ws) => {
  const userData = ws.getUserData()
  const {connectionContext} = userData
  if (!connectionContext) return
  userData.done = true
  handleDisconnect(connectionContext)
}
export default handleClose
