import FastRTCSwarm from '@mattkrick/fast-rtc-swarm'
import {LocalDict, StreamDict, StreamUI} from '../../hooks/useSwarm'
import {StreamName, StreamQuality} from './joinSwarm'

interface AddSwarm {
  type: 'addSwarm'
  swarm: FastRTCSwarm
  dispose: () => void
}

interface SetStream {
  type: 'setStream'
  userId: string
  streamName: StreamName
  streamUI: Partial<StreamUI>
}

interface AddLocalStream {
  type: 'setLocalStream'
  streamUI: StreamUI
  streamName: StreamName
  quality: StreamQuality
}

interface RemoveStream {
  type: 'removeStream'
  userId: string
}

export type SwarmAction = SetStream | AddSwarm | RemoveStream | AddLocalStream

export interface SwarmState {
  dispose: () => void
  streams: StreamDict
  localStreams: LocalDict
  swarm: FastRTCSwarm | null
}

const reducerSwarm = (state: SwarmState, action: SwarmAction) => {
  switch (action.type) {
    case 'addSwarm':
      return {...state, swarm: action.swarm, dispose: action.dispose}
    case 'setLocalStream':
      return {
        ...state,
        localStreams: {
          ...state.localStreams,
          [action.streamName]: {
            ...state.localStreams[action.streamName],
            [action.quality]: action.streamUI
          }
        }
      }
    case 'setStream':
      return {
        ...state,
        streams: {
          ...state.streams,
          [action.streamName]: {
            ...state.streams[action.streamName],
            [action.userId]: {
              ...state.streams[action.streamName][action.userId],
              ...action.streamUI
            }
          }
        }
      }
    case 'removeStream':
      if (state.streams.cam[action.userId] || state.streams.screen[action.userId]) {
        const nextStreams = {...state.streams}
        delete nextStreams.cam[action.userId]
        delete nextStreams.screen[action.userId]
        return {...state, streams: nextStreams}
      }
      return state
    default:
      return state
  }
}

export default reducerSwarm
