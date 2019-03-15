import {UWebSocket} from './handleSignal'
import sendSignal from './sendSignal'

interface LeavePayload {
  type: 'leaveSwarm'
  userId: string
}

const handleLeave = (ws: UWebSocket, payload: LeavePayload) => {
  const {
    context: {acceptedOffers}
  } = ws
  const {userId} = payload
  const id = Object.keys(acceptedOffers).find((id) => acceptedOffers[id] === userId)
  if (!id) return
  sendSignal(ws, {type: 'leaveSwarm', id})
}

export default handleLeave
