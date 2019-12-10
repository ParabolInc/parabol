import getPubSub from '../../utils/getPubSub'
import {UWebSocket} from './handleSignal'

interface AnswerPayload {
  type: 'answer'
  sdp: string
  id: string
}

const handleAnswer = (ws: UWebSocket, payload: AnswerPayload) => {
  const to = ws.context.connectedPeers[payload.id]
  getPubSub().publish(`signal/user/${to}`, {
    type: 'pubToClient',
    payload
  })
}

export default handleAnswer
