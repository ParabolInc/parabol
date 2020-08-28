import {getSignalingServerUrl} from './urlFactory'
import protoo from 'protoo-client'
import {Device, types as mediasoupTypes} from 'mediasoup-client'

const PC_PROPRIETARY_CONSTRAINTS = {
  optional: [{googDscp: true}]
}

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
  sendTransport: protoo.Transport | null
  receiveTransport: protoo.Transport | null

  constructor(opts: RoomOptions) {
    this.closed = false
    this.roomId = opts.roomId
    this.peerId = opts.peerId
    this.device = null
    this.sendTransport = null
    this.receiveTransport = null
  }

  async connect() {
    if (!(this.roomId || this.peerId)) throw new Error('Missing roomId or peerId')
    const endpoint = getSignalingServerUrl(this.roomId, this.peerId)
    console.log('Connecting...', endpoint)
    const transport = new protoo.WebSocketTransport(endpoint)
    this.createPeer(transport)
  }

  createPeer(transport: protoo.WebSocketTransport) {
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
    await this.createDevice()
    await this.createSendTransport()
    await this.createReceiveTransport()
    await this.requestJoinRoom()
    await this.enableMedia()
  }

  async createDevice() {
    console.log('creating device')
    this.device = new Device()
    const routerRtpCapabilities = await this.peer.request('getRouterRtpCapabilities')
    await this.device.load({routerRtpCapabilities})
  }

  async createSendTransport() {
    console.log('creating send transport')
    const sendTransportInfo = await this.peer.request('createWebRtcTransport', {
      producing: true,
      consuming: false
    })
    this.sendTransport = this.device.createSendTransport({
      ...sendTransportInfo,
      iceServers: [],
      proprietaryConstraints: PC_PROPRIETARY_CONSTRAINTS
    })
    this.handleTransport(this.sendTransport)
  }

  async createReceiveTransport() {
    console.log('creating receive transport')
    const receiveTransportInfo = await this.peer.request('createWebRtcTransport', {
      producing: false,
      consuming: true
    })
    this.receiveTransport = this.device.createRecvTransport({
      ...receiveTransportInfo,
      iceServers: []
    })
    this.handleTransport(this.receiveTransport)
  }

  handleTransport(transport: mediasoupTypes.Transport) {
    transport.on('connect', ({dtlsParameters}, cb, errback) => {
      console.log('handling transport connect event')
      this.peer
        .request('connectWebRtcTransport', {
          transportId: transport.id,
          dtlsParameters
        })
        .then(cb)
        .catch(errback)
    })
    if (transport.direction === 'recv') return
    transport.on('produce', () => console.log('handling produce'))
  }

  async requestJoinRoom() {
    console.log('sending request to join room...')
    const {peers} = await this.peer.request('join', {
      device: this.device,
      rtpCapabilities: this.device.rtpCapabilities
    })
    return peers
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
