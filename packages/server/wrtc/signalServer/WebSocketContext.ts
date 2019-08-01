import ConnectionChunk from './ConnectionChunk'

type WebSocketId = string
export default class WebSocketContext {
  userId?: string
  createdAt: number
  connectedPeers: {[connectionId: string]: WebSocketId} = {}
  pushQueue: ConnectionChunk[] = []
  pullQueue: string[] = []
  subs: number[] = []
  roomId: string
  constructor (roomId: string) {
    this.roomId = roomId
    this.createdAt = Date.now()
  }
}
