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
  const onClick = () => {
    if (hasVideo) {
      swarm.muteTrack('video')
      // MediaStreamTrack.onended doesn't fire when it is stopped, so we hide it manually
      swarm.emit('localSetStream', 'cam', {hasVideo: false})
    }
  }
  return (
    <Toggle onClick={onClick}>
      <Icon>{hasVideo ? 'videocam' : 'videocam_off'}</Icon>
    </Toggle>
  )
}

export default VideoToggle
