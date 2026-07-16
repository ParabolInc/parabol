import styled from '@emotion/styled'
import FlatButton from '~/components/FlatButton'
import useAtmosphere from '~/hooks/useAtmosphere'
import ResetRetroMeetingToGroupStageMutation from '~/mutations/ResetRetroMeetingToGroupStageMutation'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {DialogTitle} from '../ui/Dialog/DialogTitle'
import PrimaryButton from './PrimaryButton'

interface Props {
  isOpen: boolean
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
  color: 'var(--color-fg-secondary)',
  fontWeight: 600,
  marginRight: 16
})

const UndoableGroupPhaseDialog = (props: Props) => {
  const {isOpen, closePortal, meetingId} = props
  const atmosphere = useAtmosphere()
  const handleConfirm = () => {
    ResetRetroMeetingToGroupStageMutation(atmosphere, {meetingId}) && closePortal()
  }
  return (
    <Dialog isOpen={isOpen} onClose={closePortal}>
      <DialogContent>
        <DialogTitle>Reset meeting and edit groups?</DialogTitle>
        <p>
          <b>Danger zone</b>: to edit groups you must reset the meeting to this point.
        </p>
        <p>All votes and discussion will be lost.</p>
        <ButtonGroup>
          <StyledButton onClick={closePortal}>Cancel</StyledButton>
          <PrimaryButton onClick={handleConfirm}>Confirm Reset</PrimaryButton>
        </ButtonGroup>
      </DialogContent>
    </Dialog>
  )
}

export default UndoableGroupPhaseDialog
