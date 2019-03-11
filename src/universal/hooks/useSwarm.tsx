import FastRTCSwarm from '@mattkrick/fast-rtc-swarm'
import GQLTrebuchetClient from '@mattkrick/graphql-trebuchet-client'
import {Events} from '@mattkrick/trebuchet-client'
import {Dispatch, SetStateAction, useEffect, useState} from 'react'
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
  const swarm = new FastRTCSwarm({me: atmosphere.viewerId, sdpSemantics: 'unified-plan'})
  const {trebuchet} = atmosphere.transport as GQLTrebuchetClient
  trebuchet.on(Events.DATA, (data) => {
    if (typeof data !== 'string') return
    const payload = JSON.parse(data)
    swarm.dispatch(payload)
  })
  swarm.on('signal', (signal) => {
    // we should probably bake this into FastRTCPeer
    if (signal.type === 'init') {
      signal.roomId = roomId
    }
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
  setSwarm(swarm)
}

const useSwarm = (roomId) => {
  const atmosphere = useAtmosphere()
  const [swarm, setSwarm] = useState<FastRTCSwarm>(null)
  const [streams, setStreams] = useState<StreamDict>({})
  useEffect(() => {
    joinSwarm(atmosphere, roomId, setSwarm, streams, setStreams).catch()
    return () => {
      swarm && swarm.close()
    }
  }, [roomId])
  return streams
}

export default useSwarm
