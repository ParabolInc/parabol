import React from 'react'
import styled from 'react-emotion'
import Icon from 'universal/components/Icon'
import {StreamUI} from '../hooks/useSwarm'
import MediaSwarm from '../utils/swarm/MediaSwarm'
import MediaControlToggle from './MediaControlToggle'

const Toggle = styled(MediaControlToggle)({})

interface Props {
  localStreamUI: StreamUI
  swarm: MediaSwarm
}

const AudioToggle = (props: Props) => {
  const {swarm, localStreamUI} = props
  const {hasAudio} = localStreamUI
  const onClick = async () => {
    if (hasAudio) {
      swarm.muteWebcamAudio()
    } else {
      try {
        await swarm.broadcastWebcam('audioOnly')
      } catch (e) {
        /**/
      }
    }
  }
  return (
    <Toggle onClick={onClick}>
      <Icon>{hasAudio ? 'videocam' : 'videocam_off'}</Icon>
    </Toggle>
  )
}

export default AudioToggle
