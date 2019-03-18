import FastRTCSwarm from '@mattkrick/fast-rtc-swarm'
import React from 'react'
import styled from 'react-emotion'
import PrimaryButton from 'universal/components/PrimaryButton'
import {LocalStreamDict, StreamUI} from '../hooks/useSwarm'
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
  const addVideo = async () => {
    if (!swarm) return
    // TODO check for perms

    const localStreams = {} as LocalStreamDict
    try {
      localStreams.low = await window.navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {width: 64, height: 64}
      })
    } catch (e) {
      // TODO set to user denied view
      return
    }
    swarm.addStream(localStreams.low)
    swarm.emit('localStream', localStreams)
  }
  if (!localStreamUI) {
    return <AddVideoButton onClick={addVideo}>Add Video</AddVideoButton>
  }
  return (
    <ControlBlock>
      <ButtonWrapper>
        <VideoToggle />
      </ButtonWrapper>
      <ButtonWrapper />
    </ControlBlock>
  )
  return null
}

export default VideoControls
