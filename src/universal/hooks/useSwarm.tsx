import {useEffect, useReducer} from 'react'
import joinSwarm from '../utils/swarm/joinSwarm'
import reducerSwarm from '../utils/swarm/reducerSwarm'
import useAtmosphere from './useAtmosphere'

export interface StreamUI {
  hasVideo: boolean
  hasAudio: boolean
  isVideoBlocked: boolean
  isAudioBlocked: boolean
  stream: MediaStream
}

export interface StreamUserDict {
  [userId: string]: StreamUI
}

export interface LocalQualityDict {
  low?: MediaStream | null
  med?: MediaStream | null
  high?: MediaStream | null
}

export interface StreamDict {
  cam: StreamUserDict
  screen: StreamUserDict
}

export interface LocalDict {
  cam: LocalQualityDict
  screen: LocalQualityDict
}

const initState = {
  localStreams: {
    cam: {
      low: null,
      med: null,
      high: null
    },
    screen: {
      low: null,
      med: null,
      high: null
    }
  },
  streams: {
    cam: {},
    screen: {}
  },
  swarm: null,
  dispose: () => {
    /**/
  }
}

const useSwarm = (roomId) => {
  const atmosphere = useAtmosphere()
  const [state, dispatch] = useReducer(reducerSwarm, initState)
  useEffect(() => {
    joinSwarm(atmosphere, roomId, dispatch, state).catch()
    return () => state.dispose()
  }, [roomId])
  return state
}

export default useSwarm
