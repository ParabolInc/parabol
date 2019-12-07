import getPubSub from '../../utils/getPubSub'
import ConnectionChunk from './ConnectionChunk'
import {UWebSocket} from './handleSignal'
import sendSignal from './sendSignal'

const sendChunk = (ws: UWebSocket, connectionChunk: ConnectionChunk, userId: string) => {
  const {id, signals} = connectionChunk
  sendSignal(ws, {type: 'offerAccepted', id, userId})
  getPubSub().publish(`signal/user/${userId}`, {
    type: 'accept',
    signals,
    id,
    userId: ws.context.userId
  })
  // forward future connection requests to the peer
  ws.context.connectedPeers[id] = userId
}

export default sendChunk
