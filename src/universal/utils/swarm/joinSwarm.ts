import FastRTCSwarm from '@mattkrick/fast-rtc-swarm'
import GQLTrebuchetClient from '@mattkrick/graphql-trebuchet-client'
import {Events} from '@mattkrick/trebuchet-client'
import {Dispatch, ReducerAction} from 'react'
import Atmosphere from '../../Atmosphere'
import {StreamUI} from '../../hooks/useSwarm'
import reducerSwarm, {SwarmState} from './reducerSwarm'

export type StreamName = 'cam' | 'screen'
export type StreamQuality = 'low' | 'med' | 'high'

declare module '@mattkrick/fast-rtc-swarm' {
  interface FastRTCSwarmEvents {
    localStream: (stream: MediaStream, name: StreamName, quality: StreamQuality) => void
    localSetStream: (streamName: StreamName, streamUI: Partial<StreamUI>) => void
  }
}

const joinSwarm = async (
  atmosphere: Atmosphere,
  roomId: string,
  dispatch: Dispatch<ReducerAction<typeof reducerSwarm>>,
  oldState: SwarmState
) => {
  await atmosphere.upgradeTransport()

  let cam: MediaStream | undefined
  // const videoOnStart = window.sessionStorage.getItem('videoOnStart')
  // if (videoOnStart === 'true') {
  //   try {
  //     cam = await window.navigator.mediaDevices.getUserMedia({audio: true, video: {width: 64, height: 64}})
  //   } catch(e) {/**/}
  // }
  const swarm = new FastRTCSwarm({
    userId: atmosphere.viewerId,
    // warmup is disabled for now: https://stackoverflow.com/questions/55172865/webrtc-detecting-muted-track-faster-post-warm-up
    streams: {
      cam
    },
    roomId,
    // how many offers should be stored on the signaling server? more = faster connection, less = more memory on the server
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

  swarm.on('stream', (stream, streamName, peer) => {
    if (streamName !== 'cam') {
      console.log('screen sharing not yet implemented')
      return
    }
    console.log('got stream')
    const userId = peer.userId!
    // start out by setting hasVideo to false in case the peer is muting their video feed due to the chrome bug
    const streamUI = {
      hasAudio: false,
      hasVideo: false,
      isAudioBlocked: false,
      isVideoBlocked: false,
      stream
    } as StreamUI
    dispatch({type: 'setStream', streamName, userId, streamUI})

    const setStreamState = (streamUI: Partial<StreamUI>) => {
      dispatch({type: 'setStream', streamName, userId, streamUI})
    }

    stream.getTracks().forEach((track) => {
      const field = track.kind === 'video' ? 'hasVideo' : 'hasAudio'
      const video = document.createElement('video')

      // chrome workaround for not detecting empty tracks
      video.srcObject = new MediaStream([track])
      video.onloadedmetadata = () => {
        setStreamState({[field]: true})
      }
      const handleUnavailable = () => {
        console.log('UNAVAIL')
        setStreamState({[field]: false})
      }

      track.onmute = track.onended = handleUnavailable
      track.onunmute = () => {
        console.log('UNMUTE')
        setStreamState({[field]: true})
      }
    })
  })
  swarm.on('localStream', (stream, streamName, quality) => {
    const userId = atmosphere.viewerId
    const streamUI = {
      hasAudio: true,
      hasVideo: true,
      isAudioBlocked: false,
      isVideoBlocked: false,
      stream
    } as StreamUI
    dispatch({type: 'setLocalStream', streamName, quality, streamUI})
    dispatch({type: 'setStream', streamName, userId, streamUI})
  })
  swarm.on('close', (peer) => {
    console.log('peer closed', peer.userId)
    dispatch({type: 'removeStream', userId: peer.userId!})
  })

  swarm.on('localSetStream', (streamName, streamUI) => {
    const userId = atmosphere.viewerId
    dispatch({type: 'setStream', streamName, userId, streamUI})
  })
  swarm.on('error', console.error)

  if (cam) {
    swarm.emit('localStream', cam, 'cam', 'low')
  }

  const dispose = () => {
    swarm.off('close')
    trebuchet.off(Events.DATA, handleSignal)
    swarm.close()
  }

  dispatch({
    type: 'addSwarm',
    swarm,
    dispose
  })
  oldState.dispose = dispose
}

export default joinSwarm
