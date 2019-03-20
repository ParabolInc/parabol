import getPubSub from '../../utils/getPubSub'
import {UWebSocket} from './handleSignal'
import sendChunk from './sendChunk'
import sendSignal from './sendSignal'

export interface PubInitPayload {
  type: 'pubInit'
  createdAt: number
  userId: string
}

const handlePubInit = (ws: UWebSocket, payload: PubInitPayload) => {
  const {context} = ws
  if (!context) return
  const {userId, createdAt} = payload
  if (userId === context.userId) {
    if (context.createdAt < createdAt) {
      // the publishing websocket used an id that was already taken, kick em out
      getPubSub()
        .publish(`signal/user/${userId}`, JSON.stringify({type: 'pubKickOut', createdAt}))
        .catch()
    }
    return
  }
  const connectionChunk = context.pushQueue.pop()
  if (!connectionChunk) {
    context.pullQueue.push(userId)
  } else {
    sendChunk(ws, connectionChunk, userId)
  }
  // for every successful init, resupply the offer buffer
  sendSignal(ws, {type: 'offerRequest'})
}

export default handlePubInit
