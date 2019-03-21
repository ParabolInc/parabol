import React from 'react'
import styled from 'react-emotion'
import PrimaryButton from 'universal/components/PrimaryButton'
import {StreamUI} from '../hooks/useSwarm'
import MediaSwarm from '../utils/swarm/MediaSwarm'
import VideoToggle from './VideoToggle'

interface Props {
  swarm: MediaSwarm | null
  localStreamUI: StreamUI | undefined
}

const AddVideoButton = styled(PrimaryButton)({
  alignSelf: 'center'
})

const ControlBlock = styled('div')({
  display: 'flex'
})

const ButtonWrapper = styled('div')({
  paddingRight: 8
})

const VideoControls = (props: Props) => {
  const {localStreamUI, swarm} = props
  if (!swarm) return null
  const addVideo = async () => {
    // TODO check for perms

    try {
      await swarm.broadcastWebcam()
    } catch (e) {
      // TODO set to user denied view
      return
    }
    window.sessionStorage.setItem('videoOnStart', 'true')
  }
  if (!localStreamUI) {
    return <AddVideoButton onClick={addVideo}>Add Video</AddVideoButton>
  }
  return (
    <ControlBlock>
      <ButtonWrapper>
        <VideoToggle localStreamUI={localStreamUI} swarm={swarm} />
      </ButtonWrapper>
      <ButtonWrapper />
    </ControlBlock>
  )
  return null
}

export default VideoControls
