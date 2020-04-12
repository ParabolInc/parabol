import getPubSub from '../../utils/getPubSub'
import ConnectionChunk from './ConnectionChunk'
import {UWebSocket} from './handleSignal'
import OfferSignal from './OfferSignal'
import sendChunk from './sendChunk'

interface OfferPayloadToServer {
  type: 'offer'
  id: string
  sdp: string
}
const handleOffer = (ws: UWebSocket, payload: OfferPayloadToServer) => {
  const {id, sdp} = payload
  const {context} = ws
  const to = context.connectedPeers[id]
  if (to) {
    // the receiver is known
    getPubSub().publish(`signal/user/${to}`, {
      type: 'pubToClient',
      payload: {type: 'offer', id, sdp}
    })
    return
  }
  const existingChunk = context.pushQueue.find((connectionChunk) => connectionChunk.id === id)
  if (existingChunk) {
    // the offer is just a piece of a larger connectionChunk
    existingChunk.signals.push(new OfferSignal(sdp))
    return
  }

  context.pushQueue.push(new ConnectionChunk(id, sdp))
  const requestor = context.pullQueue.pop()
  if (requestor) {
    const connectionChunk = context.pushQueue.pop()!
    sendChunk(ws, connectionChunk, requestor)
  }
}

export default handleOffer
