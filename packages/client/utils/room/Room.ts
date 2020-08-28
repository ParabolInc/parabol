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
  micProducer: mediasoupTypes.Producer | null

  static audioCodecOptions = {
    opusStereo: 1,
    opusDtx: 1
  }

  constructor(opts: RoomOptions) {
    this.closed = false
    this.roomId = opts.roomId
    this.peerId = opts.peerId
    this.device = null
    this.sendTransport = null
    this.receiveTransport = null
    this.micProducer = null
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
    await this.enableMic()
    await this.enableWebcam()
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
      this.peer
        .request('connectWebRtcTransport', {
          transportId: transport.id,
          dtlsParameters
        })
        .then(cb)
        .catch(errback)
    })
    if (transport.direction === 'recv') return

    transport.on('produce', async ({kind, rtpParameters, appData}, cb, errback) => {
      console.log('requesting to produce...')
      try {
        const {id} = await this.peer
          .request('produce', {
            transportId: transport.id,
            kind,
            rtpParameters,
            appData
          })
          .catch((err) => errback(err))
        cb({id})
      } catch (error) {
        errback(error)
      }
    })
  }

  async requestJoinRoom() {
    console.log('sending request to join room...')
    const {peers} = await this.peer.request('join', {
      device: this.device,
      rtpCapabilities: this.device.rtpCapabilities
    })
    console.log('Peers resp:', peers)
    return peers
  }

  async enableMic() {
    console.log('enabling mic...')
    if (this.micProducer) return
    if (!this.device.canProduce('audio')) return
    const stream = await navigator.mediaDevices.getUserMedia({audio: true})
    let track = stream.getAudioTracks()[0]
    this.micProducer = await this.sendTransport.produce({
      track,
      codecOptions: Room.audioCodecOptions
    })
    this.handleMic()
  }

  handleMic() {
    console.log('setting event listeners on mic producer...')
    this.micProducer!.on('transportclose', () => console.log('handling mic transport close'))
    this.micProducer!.on('trackended', () => this.disableMic().catch(() => {}))
  }

  async disableMic() {
    console.log('disabling mic...')
  }

  async enableWebcam() {
    console.log('enabling webcam...')
  }

  close = () => {
    console.log('closing room...')
    if (this.closed) return
    this.closed = true
    this.peer.close()
  }
}
