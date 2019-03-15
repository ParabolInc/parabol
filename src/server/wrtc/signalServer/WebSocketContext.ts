import ConnectionChunk from './ConnectionChunk'

type WebSocketId = string
export default class WebSocketContext {
  userId?: string
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
}
