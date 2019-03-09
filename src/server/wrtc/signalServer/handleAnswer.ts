import getPubSub from '../../utils/getPubSub'
import {UWebSocket} from './handleSignal'

interface AnswerPayload {
  type: 'answer'
  sdp: string
  to: string
}

const handleAnswer = (ws: UWebSocket, payload: AnswerPayload) => {
  const {sdp, to} = payload
  getPubSub()
    .publish(
      `signal/user/${to}`,
      JSON.stringify({
        type: 'pubToClient',
        payload: {type: 'answer', from: ws.context.id, sdp}
      })
    )
    .catch()
}

export default handleAnswer
