import {UWebSocket} from './handleSignal'
import sendSignal from './sendSignal'

interface LeavePayload {
  type: 'leaveSwarm'
  userId: string
}

const handleLeave = (ws: UWebSocket, payload: LeavePayload) => {
  const {context} = ws
  // not sure how this occurred locally, but it did
  if (!context) return
  const {connectedPeers} = context
  const {userId} = payload
  const id = Object.keys(connectedPeers).find((id) => connectedPeers[id] === userId)
  if (!id) return
  delete connectedPeers[id]
  sendSignal(ws, {type: 'leaveSwarm', id})
}

export default handleLeave
