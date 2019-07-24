import React from 'react'
import styled from '@emotion/styled'
import Icon from './Icon'
import {StreamUI} from '../hooks/useSwarm'
import MediaSwarm from '../utils/swarm/MediaSwarm'
import MediaControlToggle from './MediaControlToggle'
import {ICON_SIZE} from '../styles/typographyV2'

const Toggle = styled(MediaControlToggle)({})
const StyledIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD18
})

interface Props {
  localStreamUI: StreamUI
  swarm: MediaSwarm
}

const VideoToggle = (props: Props) => {
  const {swarm, localStreamUI} = props
  const {hasVideo} = localStreamUI
  const onClick = async () => {
    if (hasVideo) {
      swarm.muteWebcamVideo()
    } else {
      try {
        await swarm.broadcastWebcam('lowVideo')
      } catch (e) {
        /**/
      }
    }
  }
  return (
    <Toggle onClick={onClick}>
      <StyledIcon>{hasVideo ? 'videocam' : 'videocam_off'}</StyledIcon>
    </Toggle>
  )
}

export default VideoToggle
