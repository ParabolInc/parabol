import getPubSub from '../../utils/getPubSub'
import CandidateSignal from './CandidateSignal'
import {UWebSocket} from './handleSignal'

interface CandidatePayloadToServer {
  type: 'candidate'
  id: string
  candidate: object | null
}

const handleCandidate = (ws: UWebSocket, payload: CandidatePayloadToServer) => {
  const {candidate, id} = payload
  const {context} = ws
  // if (!candidate) return
  const to = context.connectedPeers[id]
  if (to) {
    // the receiver is known
    getPubSub().publish(`signal/user/${to}`, {
      type: 'pubToClient',
      payload: {type: 'candidate', id, candidate}
    })
    return
  }
  const existingChunk = context.pushQueue.find((connectionChunk) => connectionChunk.id === id)
  if (existingChunk) {
    existingChunk.signals.push(new CandidateSignal(candidate))
  }
}

export default handleCandidate
