import getPubSub from '../../utils/getPubSub'
import ConnectionChunk from './ConnectionChunk'
import {UWebSocket} from './handleSignal'

const sendChunk = (ws: UWebSocket, connectionChunk: ConnectionChunk, requestor: string) => {
  const {connectionId, signals} = connectionChunk
  // tell the offerer that their offer was accepted by payload.from
  ws.send(JSON.stringify({type: 'offerAccepted', connectionId, from: requestor}))
  // give the requestor all the signals
  getPubSub()
    .publish(
      `signal/user/${requestor}`,
      JSON.stringify({
        type: 'pubToClient',
        payload: {type: 'accept', signals, from: ws.context.id}
      })
    )
    .catch()
  // forward future connection requests to the peer
  ws.context.acceptedOffers[connectionId] = requestor
}

export default sendChunk
