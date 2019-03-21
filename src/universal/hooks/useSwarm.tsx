import {useEffect, useReducer} from 'react'
import joinSwarm from '../utils/swarm/joinSwarm'
import reducerSwarm from '../utils/swarm/reducerSwarm'
import useAtmosphere from './useAtmosphere'

export interface StreamUI {
  hasVideo: boolean
  hasAudio: boolean
  isVideoBlocked: boolean
  isAudioBlocked: boolean
}

export interface StreamUserDict {
  [userId: string]: StreamUI
}

export interface StreamDict {
  cam: StreamUserDict
  screen: StreamUserDict
}

const initState = {
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
