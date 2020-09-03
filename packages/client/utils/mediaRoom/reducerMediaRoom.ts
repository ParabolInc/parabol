import MediaRoom from './MediaRoom'
import {DeviceInfo} from './MediaRoom'
import {types as mediasoupTypes} from 'mediasoup-client'

type MediaRoomAction =
  | InitMediaRoom
  | AddPeer
  | AddProducer
  | AddConsumer
  | RemoveProducer
  | PauseProducer
  | PauseConsumer
  | ResumeProducer
  | ResumeConsumer

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

interface PauseConsumer {
  type: 'pauseConsumer'
  consumerId: string
  origin: 'local' | 'remote'
}

interface ResumeConsumer {
  type: 'resumeConsumer'
  consumerId: string
  origin: 'local' | 'remote'
}

interface AddProducer {
  type: 'addProducer'
  producer: ProducerState
}

interface RemoveProducer {
  type: 'removeProducer'
  producerId: string
}

interface PauseProducer {
  type: 'pauseProducer'
  producerId: string
}

interface ResumeProducer {
  type: 'resumeProducer'
  producerId: string
}

export interface PeerState {
  id: string
  deviceInfo: DeviceInfo | null
  consumers: string[]
}

export interface PeersState {
  [peerId: string]: PeerState
}

export interface ProducerState {
  id: string
  paused: boolean
  track: MediaStreamTrack
  rtpParameters: mediasoupTypes.RtpParameters
  codec: string
}

export interface ProducersState {
  [producerId: string]: ProducerState
}

export interface ConsumerState {
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
  const {mediaRoom} = action
  return Object.assign({}, state, {mediaRoom})
}

const addPeerReducer = ({state, action}) => {
  const {peer} = action
  return Object.assign({}, state, {
    peers: {...state.peers, [peer.id]: peer}
  })
}

const addProducerReducer = ({state, action}) => {
  const {producer} = action
  return Object.assign({}, state, {
    producers: {...state.producers, [producer.id]: producer}
  })
}

const removeProducerReducer = ({state, action}) => {
  const {producerId} = action
  const newProducers = {...state.producers}
  delete newProducers[producerId]
  return Object.assign({}, state, {producers: newProducers})
}

const pauseProducerReducer = ({state, action}) => {
  const {producerId} = action
  const producer = state.producers[producerId]
  const newProducer = {...producer, paused: true}
  return {
    ...state,
    producers: {...state.producers, [producerId]: newProducer}
  }
}

const resumeProducerReducer = ({state, action}) => {
  const {producerId} = action
  const producer = state.producers[producerId]
  const newProducer = {...producer, paused: false}
  return Object.assign({}, state, {
    producers: {...state.producers, [producerId]: newProducer}
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

const pauseConsumerReducer = ({state, action}) => {
  const {consumerId, origin} = action
  const consumer = state.consumers[consumerId]
  const localPause = origin === 'local'
  const newConsumer = localPause
    ? {...consumer, locallyPaused: true}
    : {...consumer, remotelyPaused: true}
  return Object.assign({}, state, {
    consumers: {...state.consumers, [consumerId]: newConsumer}
  })
}

const resumeConsumerReducer = ({state, action}) => {
  const {consumerId, origin} = action
  const consumer = state.consumers[consumerId]
  const localResume = origin === 'local'
  const newConsumer = localResume
    ? {...consumer, locallyPaused: false}
    : {...consumer, remotelyPaused: false}
  return Object.assign({}, state, {
    consumers: {...state.consumers, [consumerId]: newConsumer}
  })
}

const reducerMediaRoom = (state: MediaRoomState, action: MediaRoomAction) => {
  const reducerHandlers = {
    initMediaRoom: initMediaRoomReducer,
    addPeer: addPeerReducer,
    addProducer: addProducerReducer,
    addConsumer: addConsumerReducer,
    removeProducer: removeProducerReducer,
    pauseProducer: pauseProducerReducer,
    pauseConsumer: pauseConsumerReducer,
    resumeProducer: resumeProducerReducer,
    resumeConsumer: resumeConsumerReducer
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
