import getPubSub from '../../utils/getPubSub'
import {UWebSocket} from './handleSignal'
import sendChunk from './sendChunk'

export interface PubInitPayload {
  type: 'pubInit'
  createdAt: number
  from: string
}

const handlePubInit = (ws: UWebSocket, payload: PubInitPayload) => {
  const {context} = ws
  const {from, createdAt} = payload
  if (from === ws.context.id) {
    if (context.createdAt < createdAt) {
      // the publishing websocket used an id that was already taken, kick em out
      getPubSub()
        .publish(`signal/user/${from}`, JSON.stringify({type: 'pubKickOut', createdAt: createdAt}))
        .catch()
    }
    return
  }
  const connectionChunk = context.pushQueue.pop()
  if (!connectionChunk) {
    context.pullQueue.push(from)
  } else {
    sendChunk(ws, connectionChunk, from)
    // ask the offerer for another sdp
    ws.send(JSON.stringify({type: 'offerRequest'}))
  }
}

export default handlePubInit
