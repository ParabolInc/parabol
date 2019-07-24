import MediaSwarm from './MediaSwarm'
import {StreamDict, StreamUI} from '../../hooks/useSwarm'
import {StreamName} from './joinSwarm'

interface AddSwarm {
  type: 'addSwarm'
  swarm: MediaSwarm
}

interface SetStream {
  type: 'setStream'
  userId: string
  streamName: StreamName
  streamUI: Partial<StreamUI>
}

interface RemoveStream {
  type: 'removeStream'
  userId: string
}

export type SwarmAction = SetStream | AddSwarm | RemoveStream

export interface SwarmState {
  streams: StreamDict
  swarm: MediaSwarm | null
}

const reducerSwarm = (state: SwarmState, action: SwarmAction) => {
  switch (action.type) {
    case 'addSwarm':
      return {...state, swarm: action.swarm}
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
