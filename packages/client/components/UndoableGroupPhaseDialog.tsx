import styled from '@emotion/styled'
import React from 'react'
import DialogContainer from '~/components/DialogContainer'
import DialogContent from '~/components/DialogContent'
import DialogTitle from '~/components/DialogTitle'
import FlatButton from '~/components/FlatButton'
import PrimaryButton from '~/components/PrimaryButton'
import useAtmosphere from '~/hooks/useAtmosphere'
import ResetRetroMeetingToGroupStageMutation from '~/mutations/ResetRetroMeetingToGroupStageMutation'
import {PALETTE} from '~/styles/paletteV3'

interface Props {
  closePortal: () => void
  meetingId: string
}

const ButtonGroup = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: 16
})

const StyledButton = styled(FlatButton)({
  color: PALETTE.SLATE_600,
  fontWeight: 600,
  marginRight: 16
})

const UndoableGroupPhaseDialog = (props: Props) => {
  const {closePortal, meetingId} = props
  const atmosphere = useAtmosphere()
  const handleConfirm = () => {
    ResetRetroMeetingToGroupStageMutation(atmosphere, {meetingId}) && closePortal()
  }
  return (
    <DialogContainer>
      <DialogTitle>Reset meeting and edit groups?</DialogTitle>
      <DialogContent>
        <p>
          <b>Danger zone</b>: to edit groups you must reset the meeting to this point.
        </p>
        <p>All votes and discussion will be lost.</p>
        <ButtonGroup>
          <StyledButton onClick={closePortal}>Cancel</StyledButton>
          <PrimaryButton onClick={handleConfirm}>Confirm Reset</PrimaryButton>
        </ButtonGroup>
      </DialogContent>
    </DialogContainer>
  )
}

export default UndoableGroupPhaseDialog
