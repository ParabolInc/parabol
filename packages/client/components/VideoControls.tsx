import React, {lazy, useEffect, useState} from 'react'
import styled from '@emotion/styled'
import withHotkey from 'react-hotkey-hoc'
import LoadableFreeModal from './LoadableFreeModal'
import PrimaryButton from './PrimaryButton'
import {StreamUI} from '../hooks/useSwarm'
import MediaSwarm from '../utils/swarm/MediaSwarm'
import AudioToggle from './AudioToggle'
import VideoToggle from './VideoToggle'
import useHotkey from '../hooks/useHotkey'

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

const WebcamPermissionsModal = lazy(() =>
  import(
    /* webpackChunkName: 'WebcamPermissionsModal' */ './WebcamPermissionsModal'
  )
)

const VideoControls = (props: Props) => {
  const {allowVideo, localStreamUI, swarm} = props
  const [showVideoButton, setShowVideoButton] = useState(allowVideo)
  const [deviceStatus, setDeviceStatus] = useState<PushPermissionState>('granted')
  const [isPermModalOpen, setIsPermModalOpen] = useState<boolean>(false)

  const closeModal = () => {
    setIsPermModalOpen(false)
  }

  useHotkey('l o o k a t m e', () => {
    setShowVideoButton(true)
  })

  const addVideo = async () => {
    const descriptors = ['camera', 'microphone'] as PermissionName[]
    // https://caniuse.com/#feat=permissions-api
    const permissions =
      navigator.permissions && navigator.permissions.query
        ? await Promise.all(descriptors.map((name) => navigator.permissions.query({name})))
        : []
    const isPrompting = permissions.some(({state}) => state === 'prompt')
    if (isPrompting) {
      setDeviceStatus('prompt')
      setIsPermModalOpen(true)
    }
    try {
      await swarm!.broadcastWebcam()
    } catch (e) {
      setDeviceStatus('denied')
      setIsPermModalOpen(true)
      const onChange = () => {
        closeModal()
        addVideo().catch()
      }
      permissions.forEach((perm) => (perm.onchange = onChange))
      return
    }
  }
  if (!showVideoButton || !swarm) return null

  if (!localStreamUI) {
    return (
      <>
        <AddVideoButton onClick={addVideo}>Add Video</AddVideoButton>
        <LoadableFreeModal
          background='rgba(0,0,0, 0.9)'
          LoadableComponent={WebcamPermissionsModal}
          queryVars={{status: deviceStatus}}
          isModalOpen={isPermModalOpen}
          closeModal={closeModal}
        />
      </>
    )
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
