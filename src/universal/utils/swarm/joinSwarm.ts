import GQLTrebuchetClient from '@mattkrick/graphql-trebuchet-client'
import {Dispatch, MutableRefObject, ReducerAction} from 'react'
import Atmosphere from '../../Atmosphere'
import MediaSwarm from './MediaSwarm'
import reducerSwarm from './reducerSwarm'

export type StreamName = 'cam' | 'screen'
export type StreamQuality = 'low' | 'med' | 'high'

const joinSwarm = async (
  atmosphere: Atmosphere,
  roomId: string,
  dispatchState: Dispatch<ReducerAction<typeof reducerSwarm>>,
  disposable: MutableRefObject<(() => void) | undefined>
) => {
  await atmosphere.upgradeTransport()
  const {trebuchet} = atmosphere.transport as GQLTrebuchetClient
  const swarm = new MediaSwarm({
    userId: atmosphere.viewerId,
    // disabling warmup while behind a feature flag
    // streams: {
    //   cam: {
    //     audio: 'audio',
    //     video: 'video'
    //   }
    // },
    roomId,
    // how many offers should be stored on the signaling server? more = faster connection, less = more memory on the server
    peerBuffer: 0,
    trebuchet,
    dispatchState: dispatchState
  })

  dispatchState({
    type: 'addSwarm',
    swarm
  })

  disposable.current = swarm.dispose
}

export default joinSwarm
