import useAtmosphere from '~/hooks/useAtmosphere'
import ResetRetroMeetingToGroupStageMutation from '~/mutations/ResetRetroMeetingToGroupStageMutation'
import {Button} from '../ui/Button/Button'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {DialogTitle} from '../ui/Dialog/DialogTitle'
import PrimaryButton from './PrimaryButton'

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
        <div className='mt-4 flex items-center justify-end'>
          <Button
            variant='flat'
            onClick={closePortal}
            className='mr-4 px-4 py-2 font-semibold text-fg-secondary'
          >
            Cancel
          </Button>
          <PrimaryButton onClick={handleConfirm}>Confirm Reset</PrimaryButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UndoableGroupPhaseDialog
