import {UWebSocket} from './handleSignal'

export interface PubKickOutPayload {
  type: 'pubKickOut'
  createdAt: number
}

const handlePubKickOut = (ws: UWebSocket, payload: PubKickOutPayload) => {
  if (ws.context.createdAt === payload.createdAt) {
    ws.send(JSON.stringify({type: 'signal_error', message: 'Duplicate id'}))
    ws.close(1006, 'Duplicate id')
  }
}

export default handlePubKickOut
