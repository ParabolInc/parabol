import MediaRoom from './MediaRoom'
import {DeviceInfo} from './MediaRoom'
import {types as mediasoupTypes} from 'mediasoup-client'

type MediaRoomAction = InitMediaRoom | AddPeer | AddProducer | AddConsumer

interface InitMediaRoom {
  type: 'initMediaRoom'
  mediaRoom: MediaRoom
}

interface AddPeer {
  type: 'addPeer'
  peer: PeerState
}

interface AddConsumer {
  type: 'addConsumer'
  peerId: string
  consumer: ConsumerState
}

interface AddProducer {
  type: 'addProducer'
  producer: ProducerState
}

export interface PeerState {
  id: string
  deviceInfo: DeviceInfo | null
  consumers: string[]
}

export interface PeersState {
  [peerId: string]: PeerState
}

interface ProducerState {
  id: string
  paused: boolean
  track: MediaStreamTrack
  rtpParameters: mediasoupTypes.RtpParameters
  codec: string
}

export interface ProducersState {
  [producerId: string]: ProducerState
}

interface ConsumerState {
  id: string
  // type: 'audio' | 'video'
  locallyPaused: boolean
  remotelyPaused: boolean
  rtpParameters: mediasoupTypes.RtpParameters
  priority: number
  codec: string
  track: MediaStreamTrack
  spatialLayers: number
  temporalLayers: number
  preferredSpatialLayer: number
  preferredTemporalLayer: number
}

export interface ConsumersState {
  [consumerId: string]: ConsumerState
}

export interface MediaRoomState {
  mediaRoom: MediaRoom | null // needed?
  room: {
    activeSpeakerId: string | null
  }
  me: {
    id: string | null
    deviceInfo: DeviceInfo | null
  }
  peers: PeersState
  producers: ProducersState
  consumers: ConsumersState
}

interface ReducerArgs {
  state: MediaRoomState
  action: MediaRoomAction
}

const initMediaRoomReducer = ({state, action}) => {
  const mediaRoom = action.mediaRoom
  return Object.assign({}, state, {mediaRoom})
}

const addPeerReducer = ({state, action}) => {
  const peer = action.peer
  return Object.assign({}, state, {
    peers: {...state.peers, [peer.id]: peer}
  })
}

const addProducerReducer = ({state, action}) => {
  const producer = action.producer
  return Object.assign({}, state, {
    producers: {...state.producers, [producer.id]: producer}
  })
}

const addConsumerReducer = ({state, action}) => {
  const {consumer, peerId} = action
  const peer = state.peers[peerId]
  if (!peer) {
    console.log(peerId, state.peers)
    throw new Error('no peer found for new consumer')
  }
  const newConsumers = [...peer.consumers, consumer.id]
  const newPeer = {...peer, consumers: newConsumers}
  return Object.assign({}, state, {
    consumers: {...state.consumers, [consumer.id]: consumer},
    peers: {...state.peers, [newPeer.id]: newPeer}
  })
}

const reducerMediaRoom = (state: MediaRoomState, action: MediaRoomAction) => {
  const reducerHandlers = {
    initMediaRoom: initMediaRoomReducer,
    addPeer: addPeerReducer,
    addProducer: addProducerReducer,
    addConsumer: addConsumerReducer
  } as {
    [actionType: string]: (ReducerArgs) => MediaRoomState
  }
  const reducerHandler = reducerHandlers[action.type]
  if (reducerHandler) {
    console.log('state before ', action.type, ':', state)
    const reducedState = reducerHandler({state, action})
    console.log('state after ', action.type, ':', reducedState)
    return reducedState
  }
  return state
}
export default reducerMediaRoom
