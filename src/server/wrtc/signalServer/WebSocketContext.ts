import ConnectionChunk from './ConnectionChunk'
import {InitPayload} from './handleInit'

type WebSocketId = string
export default class WebSocketContext {
  id?: string
  createdAt: number
  // FIXME: on disconnect, tell everyone in the room to remove acceptedOffers with WebSocketId as a value
  acceptedOffers: {[connectionId: string]: WebSocketId} = {}
  pushQueue: ConnectionChunk[] = []
  pullQueue: string[] = []
  subs: number[] = []
  roomId: string
  constructor (roomId: string) {
    this.roomId = roomId
    this.createdAt = Date.now()
  }

  init (payload: InitPayload) {
    const {from: id, connectionId, sdp} = payload
    this.id = id
    this.pushOffer(connectionId, sdp)
  }

  pushOffer (connectionId: string, sdp: string) {
    this.pushQueue.push(new ConnectionChunk(connectionId, sdp))
  }
}
