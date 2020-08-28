import {types as mediasoupTypes} from 'mediasoup'
import {getMediaSoupWorker} from '../server'
import protoo from 'protoo-server'
import config from '../config'
import events from 'events'

const rooms = (new Map() as unknown) as {
  [roomId: string]: Room
}

interface handlePeerRequestSignature {
  peer: protoo.Peer
  request: Request
  accept: (data: any) => typeof data
  reject: any // todo: better typing for this
}

export default class Room extends events.EventEmitter {
  roomId: string
  closed: boolean
  protooRoom: protoo.Room
  router: mediasoupTypes.Router
  audioLevelObserver: mediasoupTypes.AudioLevelObserver

  static mediaCodecs = config.mediasoup.routerOptions.mediaCodecs
  static audioLevelObserverOptions = {
    maxEntries: 1,
    threshold: -80,
    interval: 800
  }

  static async create(roomId: string): Promise<Room> {
    /* Because constructors can't be async */
    console.log('creating a new room...')
    const protooRoom = new protoo.Room()
    const worker = getMediaSoupWorker()
    const router = await worker.createRouter({mediaCodecs: Room.mediaCodecs})
    const audioLevelObserver = await router.createAudioLevelObserver(Room.audioLevelObserverOptions)
    return new Room(roomId, protooRoom, router, audioLevelObserver)
  }

  static async getCreate(roomId: string): Promise<Room> {
    if (!rooms[roomId]) rooms[roomId] = await Room.create(roomId)
    return rooms[roomId]
  }

  constructor(
    roomId: string,
    protooRoom: protoo.Room,
    router: mediasoupTypes.Router,
    audioLevelObserver: mediasoupTypes.AudioLevelObserver
  ) {
    super()
    this.setMaxListeners(Infinity)
    this.roomId = roomId
    this.closed = false
    this.protooRoom = protooRoom
    this.router = router
    this.audioLevelObserver = audioLevelObserver
    this.handleAudioLevelObserver()
  }

  close() {
    console.log('closing room...')
    this.closed = true
    this.protooRoom.close()
    this.router.close()
    this.emit('close')
  }

  handleAudioLevelObserver() {
    this.audioLevelObserver.on('volumes', (vs) => console.log('handle volumes:', vs))
    this.audioLevelObserver.on('silence', () => console.log('handle silence'))
  }

  createPeer(peerId: string, transport: mediasoupTypes.Transport) {
    const existingPeer = this.protooRoom.getPeer(peerId)
    if (existingPeer) existingPeer.close()
    const peer = this.protooRoom.createPeer(peerId, transport)

    Object.assign(
      peer.data,
      {
        joined: false,
        displayName: undefined,
        device: undefined,
        rtpCapabilities: undefined,
        sctpCapabilities: undefined
      },
      {
        transports: new Map(),
        producers: new Map(),
        consumers: new Map(),
        dataProducers: new Map(),
        dataConsumers: new Map()
      }
    )

    peer.on('close', () => console.log('handling peer close'))
    peer.on('request', (request, accept, reject) => {
      this.handlePeerRequest({peer, request, accept, reject}).catch((error) => {
        console.log('peer req failed:', error)
        reject(error)
      })
    })
  }

  async handlePeerRequest(args: handlePeerRequestSignature) {
    const requestHandlers = (new Map() as unknown) as {
      [method: string]: (handlePeerRequestSignature) => void
    }
    Object.assign(requestHandlers, {
      getRouterRtpCapabilities: this.handleGetRouterRtpCapabilities
    })
    const handler = requestHandlers[args.request.method]
    if (!handler) {
      args.reject(500, `unknown request.method "${args.request.method}"`)
      return
    }
    handler(args)
  }

  handleGetRouterRtpCapabilities = (args: handlePeerRequestSignature) => {
    args.accept(this.router.rtpCapabilities)
  }
}
