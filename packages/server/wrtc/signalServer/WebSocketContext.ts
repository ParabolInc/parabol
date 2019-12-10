import ConnectionChunk from './ConnectionChunk'
import SubscriptionIterator from '../../utils/SubscriptionIterator'

type WebSocketId = string
export default class WebSocketContext {
  userId?: string
  createdAt: number
  connectedPeers: {[connectionId: string]: WebSocketId} = {}
  pushQueue: ConnectionChunk[] = []
  pullQueue: string[] = []
  iterators: SubscriptionIterator[] = []
  roomId: string
  constructor(roomId: string) {
    this.roomId = roomId
    this.createdAt = Date.now()
  }
}
