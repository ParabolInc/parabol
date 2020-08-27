import {types as mediasoupTypes} from 'mediasoup'
import {getMediaSoupWorker} from '../server'
import protoo from 'protoo-server'
import config from '../config'

const rooms = (new Map() as unknown) as {
  [roomId: string]: Room
}

export default class Room {
  static mediaCodecs = config.mediasoup.routerOptions
  static audioLevelObserverOptions = {
    maxEntries: 1,
    threshold: -80,
    interval: 800
  }

  static async create(roomId: string) {
    const protooRoom = new protoo.Room()
    const worker = getMediaSoupWorker()
    const router = await worker.createRouter({mediaCodecs: Room.mediaCodecs})
    const audioLevelObserver = await router.createAudioLevelObserver(Room.audioLevelObserverOptions)
    return new Room(roomId, protooRoom, router, audioLevelObserver)
  }

  static async getCreate(roomId: string) {
    if (!rooms[roomId]) {
      rooms[roomId] = await Room.create(roomId)
    }
    return rooms[roomId]
  }

  constructor(
    roomId: string,
    protooRoom: protoo.Room,
    router: mediasoupTypes.Router,
    audioLevelObserver: mediasoupTypes.AudioLevelObserver
  ) {}

  createPeer(peerId: string, transport: mediasoupTypes.Transport) {}
}
