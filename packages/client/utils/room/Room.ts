import {getSignalingServerUrl} from './urlFactory'
import protoo from 'protoo-client'

interface RoomOptions {
  roomId: string
  peerId: string
}

export default class Room {
  roomId: string
  peerId: string
  closed: boolean
  peer: protoo.Peer

  constructor(opts: RoomOptions) {
    this.closed = false
    this.roomId = opts.roomId
    this.peerId = opts.peerId
    // this.deviceInfo = opts.deviceInfo
  }

  async connect() {
    if (!(this.roomId || this.peerId)) throw new Error('Missing roomId or peerId')
    const endpoint = getSignalingServerUrl(this.roomId, this.peerId)
    console.log('Connecting...', endpoint)
    const transport = new protoo.WebSocketTransport(endpoint)
    this.setPeer(transport)
  }

  async setPeer(transport: protoo.WebSocketTransport) {
    this.peer = new protoo.Peer(transport)
    this.peer.on('open', () => {
      this.preparePlumbing()
      this.join()
      this.enableMedia()
    })
  }

  async join() {
    console.log('joining...')
  }

  async enableMedia() {
    console.log('enabling media...')
  }

  async preparePlumbing() {
    console.log('laying down the plumbing...')
  }

  close = () => {
    console.log('closing room...')
    if (this.closed) return
    this.closed = true
    this.peer.close()
  }
}
