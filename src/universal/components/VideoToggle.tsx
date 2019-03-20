import FastRTCSwarm from '@mattkrick/fast-rtc-swarm'
import React from 'react'
import styled from 'react-emotion'
import Icon from 'universal/components/Icon'
import MediaControlToggle from './MediaControlToggle'

const Toggle = styled(MediaControlToggle)({})

interface Props {
  hasVideo: boolean
  swarm: FastRTCSwarm
}

const VideoToggle = (props: Props) => {
  const {swarm, hasVideo} = props
  console.log('has vid', hasVideo)
  const onClick = async () => {
    if (hasVideo) {
      swarm.muteTrack('video')
      // MediaStreamTrack.onended doesn't fire when it is stopped, so we hide it manually
      swarm.emit('localSetStream', 'cam', {hasVideo: false})
    } else {
      let cam
      try {
        cam = await window.navigator.mediaDevices.getUserMedia({
          audio: true,
          video: {width: 64, height: 64}
        })
      } catch (e) {
        /**/
        return
      }
      swarm.addStreams({cam})
      swarm.emit('localStream', cam, 'cam', 'low')
    }
  }
  return (
    <Toggle onClick={onClick}>
      <Icon>{hasVideo ? 'videocam' : 'videocam_off'}</Icon>
    </Toggle>
  )
}

export default VideoToggle
