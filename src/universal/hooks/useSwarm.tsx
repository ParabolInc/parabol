import FastRTCSwarm from '@mattkrick/fast-rtc-swarm'
import GQLTrebuchetClient from '@mattkrick/graphql-trebuchet-client'
import {Events} from '@mattkrick/trebuchet-client'
import {Dispatch, SetStateAction, useEffect, useRef, useState} from 'react'
import Atmosphere from '../Atmosphere'
import useAtmosphere from './useAtmosphere'

export interface StreamDict {
  [viewerId: string]: MediaStream[]
}

const joinSwarm = async (
  atmosphere: Atmosphere,
  roomId: string,
  setSwarm: Dispatch<any>,
  streams: StreamDict,
  setStreams: Dispatch<SetStateAction<StreamDict>>
) => {
  await atmosphere.upgradeTransport()
  // @ts-ignore
  const swarm = new FastRTCSwarm({
    id: atmosphere.viewerId,
    sdpSemantics: 'unified-plan',
    audio: {},
    video: {},
    roomId
  })
  const {trebuchet} = atmosphere.transport as GQLTrebuchetClient
  trebuchet.on(Events.DATA, (data) => {
    if (typeof data !== 'string') return
    const payload = JSON.parse(data)
    swarm.dispatch(payload)
  })
  swarm.on('signal', (signal) => {
    trebuchet.send(JSON.stringify({type: 'WRTC_SIGNAL', signal}))
  })
  swarm.on('stream', (stream, peer) => {
    const userStreams = streams[peer.id]
    if (!userStreams) {
      setStreams({...streams, [peer.id]: [stream]})
    } else if (!streams[peer.id].includes(stream)) {
      setStreams({...streams, [peer.id]: [...streams[peer.id], stream]})
    }
  })
  swarm.on('open', (peer) => {
    console.log('data open', peer)
  })
  swarm.on('close', (peer) => {
    console.log('data close', peer)
  })
  setSwarm(swarm)
}

const useSwarm = (roomId) => {
  const atmosphere = useAtmosphere()
  const [swarm, setSwarm] = useState<FastRTCSwarm | null>(null)
  const [streams, setStreams] = useState<StreamDict>({})
  const latestSwarm = useRef<FastRTCSwarm | null>(null)
  useEffect(() => {
    joinSwarm(atmosphere, roomId, setSwarm, streams, setStreams).catch()
    return () => {
      console.log('disposing of', latestSwarm.current)
      latestSwarm.current && latestSwarm.current.close()
    }
  }, [roomId])
  useEffect(() => {
    latestSwarm.current = swarm
    return () => {
      latestSwarm.current = null
    }
  })
  return {streams, swarm}
}

export default useSwarm
