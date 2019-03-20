import FastRTCSwarm from '@mattkrick/fast-rtc-swarm'
import React from 'react'
import styled from 'react-emotion'
import PrimaryButton from 'universal/components/PrimaryButton'
import {StreamUI} from '../hooks/useSwarm'
import VideoToggle from './VideoToggle'

interface Props {
  swarm: FastRTCSwarm | null
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

    let cam
    try {
      cam = await window.navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {width: 64, height: 64}
      })
    } catch (e) {
      // TODO set to user denied view
      return
    }
    window.sessionStorage.setItem('videoOnStart', 'true')
    swarm.addStreams({cam})
    swarm.emit('localStream', cam, 'cam', 'low')
  }
  if (!localStreamUI) {
    return <AddVideoButton onClick={addVideo}>Add Video</AddVideoButton>
  }
  return (
    <ControlBlock>
      <ButtonWrapper>
        <VideoToggle hasVideo={localStreamUI.hasVideo} swarm={swarm} />
      </ButtonWrapper>
      <ButtonWrapper />
    </ControlBlock>
  )
  return null
}

export default VideoControls
