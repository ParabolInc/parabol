import getPubSub from '../../utils/getPubSub'
import {UWebSocket} from './handleSignal'
import OfferSignal from './OfferSignal'
import sendChunk from './sendChunk'

export interface KnownOfferPayload {
  type: 'offer'
  to: string
  sdp: string
}

export interface UnknownOfferPayload {
  type: 'offer'
  connectionId: string
  sdp: string
}

type OfferPayload = KnownOfferPayload | UnknownOfferPayload

const handleOffer = (ws: UWebSocket, payload: OfferPayload) => {
  const {sdp} = payload
  const {context} = ws
  const to = 'to' in payload ? payload.to : context.acceptedOffers[payload.connectionId]
  if (to) {
    // the receiver is known
    getPubSub()
      .publish(
        `signal/user/${to}`,
        JSON.stringify({
          type: 'pubToClient',
          payload: {type: 'offer', from: context.id, sdp}
        })
      )
      .catch()
    return
  }
  const {connectionId} = payload as UnknownOfferPayload
  const existingChunk = context.pushQueue.find(
    (connectionChunk) => connectionChunk.connectionId === connectionId
  )
  if (existingChunk) {
    // the offer is just a piece of a larger connectionChunk
    existingChunk.signals.push(new OfferSignal(sdp))
    return
  }

  context.pushOffer(connectionId, sdp)
  const requestor = context.pullQueue.pop()
  if (requestor) {
    const connectionChunk = context.pushQueue.pop()!
    sendChunk(ws, connectionChunk, requestor)
  }
}

export default handleOffer
