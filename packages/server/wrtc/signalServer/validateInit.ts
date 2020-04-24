import closeWRTC from './closeWRTC'
import {UWebSocket} from './handleSignal'
import sendSignal from './sendSignal'
import WebSocketContext from './WebSocketContext'
import AuthToken from '../../database/types/AuthToken'

const validateInit = (
  ws: UWebSocket,
  payload: {type: string; [key: string]: any},
  authToken: AuthToken
) => {
  if (payload.type === 'init') {
    if (ws.context) {
      closeWRTC(ws)
    }
    if (!authToken.tms!.includes(payload.roomId)) {
      sendSignal(ws, {type: 'signal_error', message: 'Invalid room ID'})
      return false
    }
    ws.context = new WebSocketContext(payload.roomId)
  } else if (!ws.context) {
    sendSignal(ws, {type: 'signal_error', message: 'Payload sent before init'})
    return false
  }
  return true
}

export default validateInit
