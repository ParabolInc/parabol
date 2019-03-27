import {SwarmAccept} from '@mattkrick/fast-rtc-swarm'
import {UWebSocket} from './handleSignal'
import sendSignal from './sendSignal'

const handleAccept = (ws: UWebSocket, payload: SwarmAccept) => {
  ws.context.connectedPeers[payload.id] = payload.userId
  sendSignal(ws, payload)
}

export default handleAccept
