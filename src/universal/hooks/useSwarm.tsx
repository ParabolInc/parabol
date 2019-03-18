import FastRTCSwarm from '@mattkrick/fast-rtc-swarm'
import GQLTrebuchetClient from '@mattkrick/graphql-trebuchet-client'
import {Events} from '@mattkrick/trebuchet-client'
import {Dispatch, ReducerAction, useEffect, useReducer} from 'react'
import Atmosphere from '../Atmosphere'
import useAtmosphere from './useAtmosphere'

export interface StreamUI {
  show: boolean
  stream: MediaStream
}

export interface StreamDict {
  [userId: string]: StreamUI
}

export interface LocalStreamDict {
  low?: MediaStream | null
  med?: MediaStream | null
  high?: MediaStream | null
}

interface State {
  dispose: () => void
  streams: StreamDict
  localStreams: LocalStreamDict
  swarm: FastRTCSwarm | null
}

declare module '@mattkrick/fast-rtc-swarm' {
  interface FastRTCSwarmEvents {
    localStream: LocalStreamDict
  }
}

const initState = {
  localStreams: {
    low: null,
    med: null,
    high: null
  },
  streams: {},
  swarm: null,
  dispose: () => {
    /**/
  }
}

interface AddSwarm {
  type: 'addSwarm'
  swarm: FastRTCSwarm
  dispose: () => void
}

interface AddStream {
  type: 'addStream'
  streams: StreamDict
}

interface AddLocalStream {
  type: 'addLocalStream'
  userId: string
  localStreams: LocalStreamDict
}

interface RemoveStream {
  type: 'removeStream'
  userId: string
}

type Action = AddStream | AddSwarm | RemoveStream | AddLocalStream
const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'addSwarm':
      return {...state, swarm: action.swarm, dispose: action.dispose}
    case 'addLocalStream':
      console.log('stream', {
        ...state.streams,
        [action.userId]: action.localStreams.low || state.streams[action.userId]
      })
      const {
        userId,
        localStreams: {low}
      } = action
      return {
        ...state,
        streams: {
          ...state.streams,
          [action.userId]: low ? {show: true, stream: low} : state.streams[userId]
        },
        localStreams: {...state.localStreams, ...action.localStreams}
      }
    case 'addStream':
      return {...state, streams: {...state.streams, ...action.streams}}
    case 'removeStream':
      const nextStreams = {...state.streams}
      delete nextStreams[action.userId]
      return {...state, streams: nextStreams}
    default:
      return state
  }
}

const joinSwarm = async (
  atmosphere: Atmosphere,
  roomId: string,
  dispatch: Dispatch<ReducerAction<typeof reducer>>
) => {
  await atmosphere.upgradeTransport()
  const swarm = new FastRTCSwarm({
    userId: atmosphere.viewerId!,
    // warm-up is disabled until chrome fixes their bug where it takes 3 seconds to determine the initial dummy track should be muted
    // audio: {},
    // video: {},
    roomId,
    peerBuffer: 0
  })
  const {trebuchet} = atmosphere.transport as GQLTrebuchetClient
  const handleSignal = (data) => {
    if (typeof data !== 'string') return
    try {
      const payload = JSON.parse(data)
      if (payload.type === 'WRTC_SIGNAL') {
        swarm.dispatch(payload.signal)
      }
    } catch (e) {
      /**/
    }
  }
  trebuchet.on(Events.DATA, handleSignal)
  swarm.on('signal', (signal) => {
    trebuchet.send(JSON.stringify({type: 'WRTC_SIGNAL', signal}))
  })
  swarm.on('stream', (stream, peer) => {
    const userId = peer.userId!
    const track = stream.getTracks()[0]
    const setStream = (show) => {
      dispatch({type: 'addStream', streams: {[userId]: {show, stream}}})
    }
    track.onmute = () => {
      setStream(false)
    }
    track.onunmute = () => {
      setStream(true)
    }
    setStream(false)
  })
  swarm.on('localStream', (localStreams) => {
    dispatch({type: 'addLocalStream', userId: atmosphere.viewerId!, localStreams})
  })
  // swarm.on('open', (peer) => {
  //   console.log('data open', peer)
  // })
  // swarm.on('data', (data) => {
  //   console.log('data', data)
  // })
  swarm.on('close', (peer) => {
    dispatch({type: 'removeStream', userId: peer.userId!})
  })
  swarm.on('error', console.error)

  dispatch({
    type: 'addSwarm',
    swarm,
    dispose: () => {
      swarm.off('close')
      trebuchet.off(Events.DATA, handleSignal)
      swarm.close()
    }
  })
}

const useSwarm = (roomId) => {
  const atmosphere = useAtmosphere()
  const [state, dispatch] = useReducer(reducer, initState)
  useEffect(() => {
    joinSwarm(atmosphere, roomId, dispatch).catch()
    return () => state.dispose()
  }, [roomId])
  return state
}

export default useSwarm
