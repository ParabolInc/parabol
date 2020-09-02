import protoo from 'protoo-client'
import Room from './Room'

export default function peerFactory(transport: protoo.WebSocketTransport, room: Room) {
  const peer = new protoo.Peer(transport)
  return [peer, room]
}
