import React, {useEffect, useState} from 'react'
import styled from 'react-emotion'
import withHotkey from 'react-hotkey-hoc'
import PrimaryButton from 'universal/components/PrimaryButton'
import {StreamUI} from '../hooks/useSwarm'
import MediaSwarm from '../utils/swarm/MediaSwarm'
import AudioToggle from './AudioToggle'
import VideoToggle from './VideoToggle'

interface Props {
  allowVideo: boolean
  bindHotkey: (key: string, cb: () => void) => void
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
  const {allowVideo, localStreamUI, swarm} = props
  if (!swarm) return null
  const [showVideoButton, setShowVideoButton] = useState(allowVideo)
  useEffect(() => {
    const {bindHotkey} = props
    bindHotkey('l o o k a t m e', () => {
      setShowVideoButton(true)
    })
  }, [])
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
  if (!showVideoButton) return null

  if (!localStreamUI) {
    return <AddVideoButton onClick={addVideo}>Add Video</AddVideoButton>
  }
  return (
    <ControlBlock>
      <ButtonWrapper>
        <VideoToggle localStreamUI={localStreamUI} swarm={swarm} />
      </ButtonWrapper>
      <ButtonWrapper>
        <AudioToggle localStreamUI={localStreamUI} swarm={swarm} />
      </ButtonWrapper>
    </ControlBlock>
  )
}

export default withHotkey(VideoControls)
