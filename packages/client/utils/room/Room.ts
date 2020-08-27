import {getSignalingServerUrl} from './urlFactory'
import protoo from 'protoo-client'
import {Device} from 'mediasoup-client'

interface RoomOptions {
  roomId: string
  peerId: string
}

export default class Room {
  roomId: string
  peerId: string
  closed: boolean
  peer: protoo.Peer
  device: protoo.Device | null

  constructor(opts: RoomOptions) {
    this.closed = false
    this.roomId = opts.roomId
    this.peerId = opts.peerId
    this.device = null
  }

  async connectPeer() {
    if (!(this.roomId || this.peerId)) throw new Error('Missing roomId or peerId')
    const endpoint = getSignalingServerUrl(this.roomId, this.peerId)
    console.log('Connecting...', endpoint)
    const transport = new protoo.WebSocketTransport(endpoint)
    this.initPeer(transport)
  }

  initPeer(transport: protoo.WebSocketTransport) {
    this.peer = new protoo.Peer(transport)
    this.handlePeerConnectionStates()
    this.handlePeerRequests()
    this.handlePeerNotifications()
  }

  handlePeerConnectionStates() {
    this.peer.on('open', () => this.join())
    this.peer.on('failed', () => console.log('failed handler'))
    this.peer.on('disconnected', () => console.log('disconnected handler'))
    this.peer.on('close', () => this.close())
  }

  handlePeerRequests() {}
  handlePeerNotifications() {}

  async join() {
    console.log('joining...')
    this.connectMedia()
    this.enableMedia()
  }

  async connectMedia() {
    console.log('connecting media...')
    this.device = new Device()
    const routerRtpCapabilities = this.peer.request('getRouterRtpCapabilities')
    console.log(routerRtpCapabilities)
    await this.device.load({routerRtpCapabilities})
  }

  async enableMedia() {
    console.log('enabling media...')
  }

  close = () => {
    console.log('closing room...')
    if (this.closed) return
    this.closed = true
    this.peer.close()
  }
}
