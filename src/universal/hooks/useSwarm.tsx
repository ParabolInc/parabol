import FastRTCSwarm from '@mattkrick/fast-rtc-swarm'
import GQLTrebuchetClient from '@mattkrick/graphql-trebuchet-client'
import {Events} from '@mattkrick/trebuchet-client'
import {Dispatch, SetStateAction, useEffect, useState} from 'react'
import {Disposable} from 'relay-runtime'
import Atmosphere from '../Atmosphere'
import useAtmosphere from './useAtmosphere'

export interface StreamUI {
  show: boolean
  stream: MediaStream
}

export interface StreamDict {
  [viewerId: string]: StreamUI
}

const joinSwarm = async (
  atmosphere: Atmosphere,
  roomId: string,
  setSwarm: Dispatch<any>,
  streams: StreamDict,
  setStreams: Dispatch<SetStateAction<StreamDict>>,
  disposable: Disposable
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
    const setStream = (show) => setStreams({...streams, [userId]: {show, stream}})
    track.onmute = () => {
      setStream(false)
    }
    track.onunmute = () => {
      setStream(true)
    }
    setStream(false)
  })
  // swarm.on('open', (peer) => {
  //   console.log('data open', peer)
  // })
  // swarm.on('data', (data) => {
  //   console.log('data', data)
  // })
  swarm.on('close', (peer) => {
    console.log('swarm close called', peer)
    const nextStreams = {...streams}
    delete nextStreams[peer.userId!]
    setStreams(nextStreams)
  })
  swarm.on('error', console.error)

  setSwarm(swarm)
  disposable.dispose = () => {
    swarm.off('close')
    trebuchet.off(Events.DATA, handleSignal)
    swarm.close()
  }
}

const useSwarm = (roomId) => {
  const atmosphere = useAtmosphere()
  const [swarm, setSwarm] = useState<FastRTCSwarm | null>(null)
  const [streams, setStreams] = useState<StreamDict>({})
  useEffect(() => {
    const disposable = {
      dispose: () => {
        /**/
      }
    }
    joinSwarm(atmosphere, roomId, setSwarm, streams, setStreams, disposable).catch()
    return () => disposable.dispose()
  }, [roomId])
  return {streams, swarm}
}

export default useSwarm
