import FastRTCSwarm, {FastRTCSwarmEvents, SwarmConfig} from '@mattkrick/fast-rtc-swarm'
import {Events, Trebuchet} from '@mattkrick/trebuchet-client'
import {Dispatch, ReducerAction} from 'react'
import {StreamUI} from '../../hooks/useSwarm'
import {StreamName} from './joinSwarm'
import reducerSwarm from './reducerSwarm'

export interface LocalQualityDict {
  low: MediaStream | null
  med: MediaStream | null
  high: MediaStream | null
}

const qualityDict: LocalQualityDict = {low: null, med: null, high: null}

interface Config extends SwarmConfig {
  dispatchState: Dispatch<ReducerAction<typeof reducerSwarm>>
  trebuchet: Trebuchet
  userId: string
}

const qualityConstraints = {
  low: {audio: true, video: {width: 64, height: 64}},
  lowVideo: {audio: false, video: {width: 64, height: 64}}
}

export default class MediaSwarm extends FastRTCSwarm {
  trebuchet: Trebuchet
  dispatchState: Dispatch<ReducerAction<typeof reducerSwarm>>
  userId: string
  localStreams = {
    cam: {...qualityDict},
    screen: {...qualityDict}
  }

  constructor (config: Config) {
    super(config)
    this.dispatchState = config.dispatchState
    this.trebuchet = config.trebuchet
    this.userId = config.userId
    this.trebuchet.on(Events.DATA, this.handleSignal)
    this.on('signal', (signal) => {
      this.trebuchet.send(JSON.stringify({type: 'WRTC_SIGNAL', signal}))
    })
    this.on('stream', this.handleStream)
    this.on('close', this.handleClose)
    // see if we fixed all the signaling errors
    this.on('error', console.error)

    this.on('connection', console.log)
    this.on('open', (peer) => {
      console.log('open', peer)
    })
  }

  private handleClose = () => {
    this.dispatchState({type: 'removeStream', userId: this.userId})
  }

  private handleSignal = (data) => {
    if (typeof data !== 'string') return
    try {
      const payload = JSON.parse(data)
      if (payload.type === 'WRTC_SIGNAL') {
        this.dispatch(payload.signal)
      }
    } catch (e) {
      /**/
    }
  }

  private handleStream: FastRTCSwarmEvents['stream'] = (stream, streamName, peer) => {
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
      isVideoBlocked: false
    } as StreamUI
    this.dispatchState({type: 'setStream', streamName, userId, streamUI})

    const setStreamState = (streamUI: Partial<StreamUI>) => {
      this.dispatchState({type: 'setStream', streamName, userId, streamUI})
    }

    stream.getTracks().forEach((track) => {
      const field = track.kind === 'video' ? 'hasVideo' : 'hasAudio'
      const video = document.createElement('video')

      // chrome workaround for not detecting empty tracks
      video.srcObject = new MediaStream([track])
      video.onloadedmetadata = () => {
        console.log('METADATA LOADED (chrome unmuted workaround)')
        if (track.readyState === 'live') {
          setStreamState({[field]: true})
        }
      }

      track.onended = () => {
        console.log('ENDED')
        setStreamState({[field]: false})
      }
      track.onmute = () => {
        console.log('MUTED')
        setStreamState({[field]: false})
      }
      track.onunmute = () => {
        console.log('UNMUTE')
        setStreamState({[field]: true})
      }
    })
  }

  getStream = (streamName: StreamName, userId: string) => {
    for (const peer of this.peers.values()) {
      if (peer.userId === userId) {
        return peer.remoteStreams[streamName]
      }
    }
    return null
  }

  broadcastWebcam = async (quality: keyof typeof qualityConstraints = 'low') => {
    const constraints = qualityConstraints[quality]
    const streamName = 'cam'
    let cam: MediaStream
    try {
      cam = await window.navigator.mediaDevices.getUserMedia(constraints)
    } catch (e) {
      throw e
    }

    if (quality === 'low') {
      this.localStreams.cam[quality] = cam
      const streamUI = {
        hasAudio: true,
        hasVideo: true,
        isAudioBlocked: true,
        // don't wanna hear ourselves!
        isVideoBlocked: false
      } as StreamUI
      this.dispatchState({type: 'setStream', streamName, userId: this.userId, streamUI})
      // TODO if we keep this here, we should rename the function to eg broadcast webcam
      this.addStreams({cam})
    } else if (quality === 'lowVideo') {
      const existing = this.localStreams.cam.low
      this.localStreams.cam.low = cam
      if (existing) {
        const [oldAudioTrack] = existing.getAudioTracks()
        if (oldAudioTrack) {
          cam.addTrack(oldAudioTrack)
        }
      }
      const streamUI = {
        hasVideo: true,
        isBlockedBlocked: false
      }
      this.dispatchState({type: 'setStream', streamName, userId: this.userId, streamUI})
      this.addStreams({cam: this.localStreams.cam.low})
    }
  }

  muteWebcamVideo = () => {
    this.dispatchState({
      type: 'setStream',
      streamName: 'cam',
      userId: this.userId,
      streamUI: {hasVideo: false}
    })
    setTimeout(() => {
      // video -> avatar is better than video -> black flicker -> avatar
      this.muteTrack('video')
    })
  }

  dispose = () => {
    this.off('close')
    this.trebuchet.off(Events.DATA, this.handleSignal)
    this.close()
  }
}
