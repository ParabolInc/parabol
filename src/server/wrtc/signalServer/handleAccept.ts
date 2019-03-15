import {CandidatePayload, OfferPayload} from '@mattkrick/fast-rtc-peer'
import {UWebSocket} from './handleSignal'
import sendSignal from './sendSignal'

interface AcceptPayload {
  type: 'accept'
  signals: Array<OfferPayload | CandidatePayload>
  id: string
  userId: string
}

const handleAccept = (ws: UWebSocket, payload: AcceptPayload) => {
  ws.context.acceptedOffers[payload.id] = payload.userId
  sendSignal(ws, payload)
}

export default handleAccept
