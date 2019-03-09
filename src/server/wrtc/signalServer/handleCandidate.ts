import getPubSub from '../../utils/getPubSub'
import CandidateSignal from './CandidateSignal'
import {UWebSocket} from './handleSignal'

export interface KnownCandidatePayload {
  type: 'offer'
  to: string
  candidate: object | null
}

export interface UnknownCandidatePayload {
  type: 'offer'
  connectionId: string
  candidate: object | null
}

type CandidatePayload = KnownCandidatePayload | UnknownCandidatePayload

const handleCandidate = (ws: UWebSocket, payload: CandidatePayload) => {
  const {candidate} = payload
  const {context} = ws
  if (!candidate) return
  const to = 'to' in payload ? payload.to : context.acceptedOffers[payload.connectionId]
  if (to) {
    // the receiver is known
    getPubSub()
      .publish(
        `signal/user/${to}`,
        JSON.stringify({
          type: 'pubToClient',
          payload: {type: 'candidate', from: context.id, candidate}
        })
      )
      .catch()
    return
  }
  const {connectionId} = payload as UnknownCandidatePayload
  const existingChunk = context.pushQueue.find(
    (connectionSignal) => connectionSignal.connectionId === connectionId
  )
  if (existingChunk) {
    existingChunk.signals.push(new CandidateSignal(candidate))
  }
}

export default handleCandidate
