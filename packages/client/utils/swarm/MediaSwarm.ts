import FastRTCSwarm, {FastRTCSwarmEvents, SwarmConfig} from '@mattkrick/fast-rtc-swarm'
import {Trebuchet} from '@mattkrick/trebuchet-client'
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
  audioOnly: {audio: true, video: false},
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

  constructor(config: Config) {
    super(config)
    this.dispatchState = config.dispatchState
    this.trebuchet = config.trebuchet
    this.userId = config.userId
    this.trebuchet.on('data', this.handleSignal)
    this.on('signal', (signal) => {
      this.trebuchet.send({type: 'WRTC_SIGNAL', signal})
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

  private handleClose: FastRTCSwarmEvents['close'] = (peer) => {
    if (peer.userId) {
      this.dispatchState({type: 'removeStream', userId: peer.userId})
    }
  }

  private handleSignal = (data) => {
    if (data.type === 'WRTC_SIGNAL') {
      this.dispatch(data.signal)
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
        // don't wanna hear ourselves!
        isAudioBlocked: true,
        isVideoBlocked: false
      } as StreamUI
      this.dispatchState({type: 'setStream', streamName, userId: this.userId, streamUI})
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
        isVideoBlocked: false
      }
      this.dispatchState({type: 'setStream', streamName, userId: this.userId, streamUI})
      this.addStreams({cam: this.localStreams.cam.low})
    } else if (quality === 'audioOnly') {
      const existing = this.localStreams.cam.low
      if (existing) {
        existing.removeTrack(existing.getAudioTracks()[0])
        existing.addTrack(cam.getAudioTracks()[0])
      } else {
        this.localStreams.cam.low = cam
      }
      const streamUI = {
        hasAudio: true,
        // don't wanna hear ourselves!
        isAudioBlocked: true
      }
      this.dispatchState({type: 'setStream', streamName, userId: this.userId, streamUI})
      this.addStreams({cam: this.localStreams.cam.low!})
    }
  }

  muteWebcamAudio = () => {
    this.dispatchState({
      type: 'setStream',
      streamName: 'cam',
      userId: this.userId,
      streamUI: {hasAudio: false}
    })
    this.muteTrack('audio')
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
    this.dispatchState = () => {
      /**/
    }
    this.off('close')
    this.trebuchet.off('data', this.handleSignal)
    this.close()
  }
}
