import styled from '@emotion/styled'
import React from 'react'
import DialogContainer from '~/components/DialogContainer'
import DialogContent from '~/components/DialogContent'
import DialogTitle from '~/components/DialogTitle'
import FlatButton from '~/components/FlatButton'
import PrimaryButton from '~/components/PrimaryButton'
import useAtmosphere from '~/hooks/useAtmosphere'
import ResetRetroMeetingToReflectStageMutation from '~/mutations/ResetRetroMeetingToReflectStageMutation'
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

const UndoableReflectPhaseDialog = (props: Props) => {
  const {closePortal, meetingId} = props
  const atmosphere = useAtmosphere()
  const handleConfirm = () => {
    ResetRetroMeetingToReflectStageMutation(atmosphere, {meetingId}) && closePortal()
  }
  return (
    <DialogContainer>
      <DialogTitle>Reset meeting?</DialogTitle>
      <DialogContent>
        <p>
          <b>Danger zone</b>: The meeting will be reset to this point.
        </p>
        <p>All reflections will remain.</p>
        <p>All groups, votes and discussion will be lost. </p>
        <ButtonGroup>
          <StyledButton onClick={closePortal}>Cancel</StyledButton>
          <PrimaryButton onClick={handleConfirm}>Confirm Reset</PrimaryButton>
        </ButtonGroup>
      </DialogContent>
    </DialogContainer>
  )
}

export default UndoableReflectPhaseDialog
