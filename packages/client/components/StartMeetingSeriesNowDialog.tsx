import {Button} from '../ui/Button/Button'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogActions} from '../ui/Dialog/DialogActions'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {DialogDescription} from '../ui/Dialog/DialogDescription'
import {DialogTitle} from '../ui/Dialog/DialogTitle'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isSubmitting: boolean
  teamCount: number
}

const StartMeetingSeriesNowDialog = (props: Props) => {
  const {isOpen, onClose, onConfirm, isSubmitting, teamCount} = props
  const teams =
    teamCount === 1 ? '' : teamCount === 2 ? ' for both teams' : ` for all ${teamCount} teams`
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className='md:max-w-md'>
        <DialogTitle>Start next meeting now?</DialogTitle>
        <DialogDescription>
          This will end the current meeting{teams} and start the next one immediately.
        </DialogDescription>
        <DialogActions>
          <Button variant='outline' size='md' onClick={onClose}>
            Cancel
          </Button>
          <Button variant='dialogPrimary' size='md' onClick={onConfirm} disabled={isSubmitting}>
            Start next meeting
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default StartMeetingSeriesNowDialog
