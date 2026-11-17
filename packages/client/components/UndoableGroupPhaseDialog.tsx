import useAtmosphere from '~/hooks/useAtmosphere'
import ResetRetroMeetingToGroupStageMutation from '~/mutations/ResetRetroMeetingToGroupStageMutation'
import {Button} from '../ui/Button/Button'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogActions} from '../ui/Dialog/DialogActions'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {DialogTitle} from '../ui/Dialog/DialogTitle'

interface Props {
  isOpen: boolean
  closePortal: () => void
  meetingId: string
}

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
        <DialogActions>
          <Button variant='outline' size='md' onClick={closePortal}>
            Cancel
          </Button>
          <Button variant='primary' size='md' onClick={handleConfirm}>
            Confirm Reset
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default UndoableGroupPhaseDialog
