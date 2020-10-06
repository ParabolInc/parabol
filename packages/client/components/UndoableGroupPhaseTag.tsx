import React from 'react'
import PhaseCompletedTag from '~/components/Tag/PhaseCompleteTag'
import useModal from '~/hooks/useModal'
import lazyPreload from '~/utils/lazyPreload'
import styled from '@emotion/styled'
import FlatButton from '~/components/FlatButton'
import Icon from '~/components/Icon'

interface Props {
  meetingId: string
  resetToStageId: string
}

const Wrapper = styled('div')({
  alignItems: 'flex-start',
  display: 'flex'
})

const StyledButton = styled(FlatButton)({
  fontWeight: 600,
  height: 28,
  marginLeft: 16,
  padding: 0
})

const StyledIcon = styled(Icon)({
  marginRight: 4
})

const UndoableGroupPhaseDialog = lazyPreload(() =>
  import(/* webpackChunkName: 'UndoableGroupPhaseDialog' */ './UndoableGroupPhaseDialog')
)

const UndoableGroupPhaseTag = (props: Props) => {
  const {meetingId, resetToStageId} = props
  const {togglePortal: toggleModal, closePortal: closeModal, modalPortal} = useModal()
  return (
    <Wrapper>
      <PhaseCompletedTag>Phase Completed</PhaseCompletedTag>
      <StyledButton onClick={toggleModal} palette={'blue'}><StyledIcon>edit</StyledIcon>{' Edit Groups'}</StyledButton>
      {modalPortal(<UndoableGroupPhaseDialog closePortal={closeModal} meetingId={meetingId} resetToStageId={resetToStageId} />)}
    </Wrapper>
  )
}

export default UndoableGroupPhaseTag
