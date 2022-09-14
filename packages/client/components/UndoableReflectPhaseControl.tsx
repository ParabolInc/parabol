import styled from '@emotion/styled'
import React from 'react'
import FlatButton from '~/components/FlatButton'
import Icon from '~/components/Icon'
import useAtmosphere from '~/hooks/useAtmosphere'
import useHotkey from '~/hooks/useHotkey'
import useModal from '~/hooks/useModal'
import ResetRetroMeetingToReflectStageMutation from '~/mutations/ResetRetroMeetingToReflectStageMutation'
import lazyPreload from '~/utils/lazyPreload'

interface Props {
  meetingId: string
}

const StyledButton = styled(FlatButton)({
  fontWeight: 600,
  height: 28,
  marginLeft: 16,
  padding: 0
})

const StyledIcon = styled(Icon)({
  marginRight: 4
})

const UndoableReflectPhaseDialog = lazyPreload(
  () => import(/* webpackChunkName: 'UndoableReflectPhaseDialog' */ './UndoableReflectPhaseDialog')
)

const UndoableReflectPhaseControl = (props: Props) => {
  const {meetingId} = props
  const {togglePortal: toggleModal, closePortal: closeModal, modalPortal} = useModal()
  const atmosphere = useAtmosphere()
  useHotkey('i d i d n t m e a n t o', () => {
    console.log('didntmean')
    ResetRetroMeetingToReflectStageMutation(atmosphere, {meetingId})
  })
  return (
    <>
      <StyledButton onClick={toggleModal} palette={'blue'}>
        <StyledIcon>restart_alt</StyledIcon>
        {' Reset meeting'}
      </StyledButton>
      {modalPortal(<UndoableReflectPhaseDialog closePortal={closeModal} meetingId={meetingId} />)}
    </>
  )
}

export default UndoableReflectPhaseControl
