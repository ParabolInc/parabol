import {getSignalingServerUrl} from './urlFactory'
import protoo from 'protoo-client'
import {Device, types as mediasoupTypes, parseScalabilityMode} from 'mediasoup-client'
import {Dispatch, ReducerAction} from 'react'
import reducerMediaRoom from './reducerMediaRoom'
import {PeerState, RoomStateEnum} from './reducerMediaRoom'

const VIDEO_CONSTRAINS = {
  qvga: {
    width: {ideal: 320},
    height: {ideal: 240}
  },
  vga: {
    width: {ideal: 640},
    height: {ideal: 480}
  },
  hd: {
    width: {ideal: 1280},
    height: {ideal: 720}
  }
}

const WEBCAM_SIMULCAST_ENCODINGS = [
  {
    scaleResolutionDownBy: 4,
    maxBitrate: 500000
  },
  {
    scaleResolutionDownBy: 2,
    maxBitrate: 1000000
  },
  {
    scaleResolutionDownBy: 1,
    maxBitrate: 5000000
  }
]

const VIDEO_CODEC_OPTIONS = {videoGoogleStartBitrate: 1000}

const PC_PROPRIETARY_CONSTRAINTS = {
  optional: [{googDscp: true}]
}

interface Webcam {
  device: MediaDeviceInfo | null
  resolution: 'qvga' | 'vga' | 'hd'
}

interface handlePeerRequestSignature {
  peer: protoo.Peer
  request: any
  accept: (data?: any) => typeof data
  reject: any // todo: better typing for this
}

interface protooNotification {
  notification: true
  method: string
  data: {[key: string]: any}
}

export interface DeviceInfo {
  flag: string
  name: string
  version: string
}

export default class MediaRoom {
  authToken: string | null
  teamId: string
  roomId: string
  peerId: string
  dispatch: Dispatch<ReducerAction<typeof reducerMediaRoom>>
  closed: boolean
  peer: protoo.Peer
  deviceInfo: DeviceInfo | null
  device: protoo.Device | null
  sendTransport: protoo.Transport | null
  receiveTransport: protoo.Transport | null
  micProducer: mediasoupTypes.Producer | null
  webcamProducer: mediasoupTypes.Producer | null
  webcams: Map<string, MediaDeviceInfo>
  webcam: Webcam
  consumers: Map<string, mediasoupTypes.Consumer>

  static audioCodecOptions = {
    opusStereo: 1,
    opusDtx: 1
  }

  constructor({
    authToken,
    teamId,
    roomId,
    peerId,
    dispatch
  }: {
    authToken: string | null
    teamId: string
    roomId: string
    peerId: string
    dispatch: Dispatch<ReducerAction<typeof reducerMediaRoom>>
  }) {
    this.closed = false
    this.authToken = authToken
    this.teamId = teamId
    this.roomId = roomId
    this.peerId = peerId
    this.dispatch = dispatch
    this.deviceInfo = null
    this.device = null
    this.sendTransport = null
    this.receiveTransport = null
    this.micProducer = null
    this.webcamProducer = null
    this.webcams = new Map()
    this.webcam = {
      device: null,
      resolution: 'hd'
    }
    this.consumers = new Map()
    this.dispatch({type: 'initMediaRoom', mediaRoom: this})
  }

  async connect() {
    const {roomId, peerId, authToken, teamId} = this
    if (!authToken) throw new Error('Missing auth token')
    if (!(roomId || peerId || teamId)) throw new Error('Missing roomId, peerId, or teamId')
    const endpoint = getSignalingServerUrl({
      roomId,
      peerId,
      authToken,
      teamId
    })
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

  handlePeerRequests() {
    const requestHandlers = {
      newConsumer: this.handleNewConsumer
    } as {[method: string]: (handlePeerRequestSignature) => void}

    this.peer.on('request', (request, accept, reject) => {
      const handler = requestHandlers[request.method]
      if (!handler) {
        reject(500, `unknown request.method "${request.method}"`)
        return
      }
      const peer = this.peer
      handler({peer, request, accept, reject})
    })
  }

  handleNewConsumer = async ({request, accept}: handlePeerRequestSignature) => {
    const {peerId, producerId, id, kind, appData, rtpParameters} = request.data
    const consumer = await this.receiveTransport.consume({
      id,
      producerId,
      kind,
      rtpParameters,
      appData: {...appData, peerId}
    })
    this.consumers.set(consumer.id, consumer)
    consumer.on('transportclose', () => this.consumers.delete(consumer.id))
    accept()
    console.log('created new consumer:', consumer)
    const {spatialLayers, temporalLayers} = parseScalabilityMode(
      consumer.rtpParameters.encodings[0].scalabilityMode
    )
    this.dispatch({
      type: 'addConsumer',
      peerId,
      consumer: {
        id,
        locallyPaused: false,
        remotelyPaused: false,
        rtpParameters,
        priority: 1,
        codec: rtpParameters.codecs[0].mimeType.split('/')[1],
        track: consumer.track,
        spatialLayers,
        temporalLayers,
        preferredSpatialLayer: spatialLayers - 1,
        preferredTemporalLayer: temporalLayers - 1
      }
    })
  }

  handlePeerNotifications() {
    const notifyHandlers = {
      newPeer: this.notifyNewPeer,
      consumerPaused: this.pauseConsumer,
      consumerResumed: this.resumeConsumer,
      consumerClosed: this.closeConsumer,
      peerClosed: this.closePeer
    } as {
      [method: string]: (protooNotification) => void
    }
    this.peer.on('notification', (notification) => {
      const handler = notifyHandlers[notification.method]
      if (!handler) {
        console.log(`unknown notification.method "${notification.method}"`)
        return
      }
      handler(notification)
    })
  }

  notifyNewPeer = ({data}: protooNotification) => {
    const peer = data as PeerState
    console.log('notified of new peer:', peer)
    this.dispatch({
      type: 'addPeer',
      peer: {...peer, consumers: []}
    })
  }

  pauseConsumer = ({data}: protooNotification) => {
    const {consumerId} = data
    const consumer = this.consumers.get(consumerId)
    if (!consumer) return
    consumer.pause()
    this.dispatch({type: 'pauseConsumer', consumerId, origin: 'remote'})
  }

  resumeConsumer = ({data}: protooNotification) => {
    const {consumerId} = data
    const consumer = this.consumers.get(consumerId)
    if (!consumer) return
    consumer.resume()
    this.dispatch({type: 'resumeConsumer', consumerId, origin: 'remote'})
  }

  closeConsumer = ({data}: protooNotification) => {
    const {consumerId} = data
    const consumer = this.consumers.get(consumerId)
    if (!consumer) return
    consumer.close()
    const {peerId} = consumer.appData
    this.dispatch({type: 'removeConsumer', consumerId, peerId})
  }

  closePeer = ({data}: protooNotification) => {
    const {peerId} = data
    this.dispatch({type: 'removePeer', peerId})
  }

  async join() {
    await this.createDevice()
    await this.createSendTransport()
    await this.createReceiveTransport()
    await this.requestJoinRoom()
    await this.enableMic()
    await this.enableWebcam()
    console.log('Done joining!')
    console.log('Mic Producer:', this.micProducer)
    console.log('Webcam Producer:', this.webcamProducer)
    console.log('Consumers:', this.consumers)
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
      device: this.deviceInfo,
      rtpCapabilities: this.device.rtpCapabilities
    })
    this.dispatch({
      type: 'setRoomState',
      state: RoomStateEnum.connected
    })
    console.log('Peers resp:', peers)
    for (const peer of peers) {
      this.dispatch({
        type: 'addPeer',
        peer: {...peer, consumers: []}
      })
    }
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
      codecOptions: MediaRoom.audioCodecOptions
    })
    const {id, paused, rtpParameters} = this.micProducer!
    const producerForDispatch = {
      id,
      paused,
      track,
      rtpParameters,
      codec: rtpParameters.codecs[0].mimeType.split('/')[1]
    }
    this.dispatch({type: 'addProducer', producer: producerForDispatch})
    this.handleMic()
  }

  handleMic() {
    console.log('setting event listeners on mic producer...')
    this.micProducer!.on('transportclose', () => console.log('handling mic transport close'))
    this.micProducer!.on('trackended', () => this.disableMic().catch(() => {}))
  }

  async enableWebcam() {
    console.log('enabling webcam...')
    if (this.webcamProducer) return
    if (!this.device.canProduce('video')) return
    await this.updateWebcams()
    if (!this.webcam.device) throw new Error('no webcam devices')
    const {device, resolution} = this.webcam
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: {ideal: device.deviceId},
        ...VIDEO_CONSTRAINS[resolution]
      }
    })
    const track = stream.getVideoTracks()[0]
    // hard code using simulcast
    this.webcamProducer = await this.sendTransport.produce({
      track,
      encodings: WEBCAM_SIMULCAST_ENCODINGS,
      codecOptions: VIDEO_CODEC_OPTIONS
    })
    const {id, paused, rtpParameters} = this.webcamProducer!
    const producerForDispatch = {
      id,
      paused,
      track,
      rtpParameters,
      codec: rtpParameters.codecs[0].mimeType.split('/')[1]
    }
    this.dispatch({type: 'addProducer', producer: producerForDispatch})
    this.handleWebcam()
  }

  handleWebcam() {
    console.log('setting event listeners on webcam producer...')
    this.webcamProducer!.on('transportclose', () => console.log('handle webcam transport close'))
    this.webcamProducer!.on('trackended', () => this.disableWebcam().catch(() => {}))
  }

  disableWebcam = async () => await this.closeProducer(this.webcamProducer!)
  disableMic = async () => await this.closeProducer(this.micProducer!)

  async closeProducer(producer: mediasoupTypes.Producer) {
    if (!producer) return
    console.log('disabling producer:', producer)
    producer.close()
    this.dispatch({type: 'removeProducer', producerId: producer.id})
    await this.peer.request('closeProducer', {producerId: producer.id})
    if (producer.kind === 'audio') this.micProducer = null
    if (producer.kind === 'video') this.webcamProducer = null
  }

  async pauseProducer(producer: mediasoupTypes.Producer) {
    if (!producer) return
    producer.pause()
    await this.peer.request('pauseProducer', {producerId: producer.id})
    this.dispatch({type: 'pauseProducer', producerId: producer.id})
  }

  async resumeProducer(producer: mediasoupTypes.Producer) {
    if (!producer) return
    producer.resume()
    await this.peer.request('resumeProducer', {producerId: producer.id})
    this.dispatch({type: 'resumeProducer', producerId: producer.id})
  }

  muteMic = async () => await this.pauseProducer(this.micProducer!)
  unmuteMic = async () => await this.resumeProducer(this.micProducer!)

  async updateWebcams() {
    this.webcams = new Map()
    const devices = await navigator.mediaDevices.enumerateDevices()
    for (const device of devices) {
      if (device.kind !== 'videoinput') continue
      this.webcams.set(device.deviceId, device)
    }
    const currentWebcamId = this.webcam.device?.deviceId || undefined
    if (this.webcams.size === 0) {
      this.webcam.device = null
    } else if (!this.webcams.has(currentWebcamId as string)) {
      this.webcam.device = Array.from(this.webcams.values())[0]
    }
  }

  close = () => {
    console.log('closing room...')
    if (this.closed) return
    this.closed = true
    if (this.peer) this.peer.close()
    if (this.sendTransport) this.sendTransport.close()
    if (this.receiveTransport) this.receiveTransport.close()
    this.dispatch({type: 'setRoomState', state: RoomStateEnum.closed})
  }
}
