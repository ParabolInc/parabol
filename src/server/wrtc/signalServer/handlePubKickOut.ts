import {UWebSocket} from './handleSignal'
import sendSignal from './sendSignal'

export interface PubKickOutPayload {
  type: 'pubKickOut'
  createdAt: number
}

const handlePubKickOut = (ws: UWebSocket, payload: PubKickOutPayload) => {
  if (ws.context.createdAt === payload.createdAt) {
    sendSignal(ws, {type: 'signal_error', message: 'Duplicate id'})
    ws.close(1006, 'Duplicate id')
  }
}

export default handlePubKickOut
