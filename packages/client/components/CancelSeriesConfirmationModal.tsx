import {Button} from '../ui/Button/Button'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogActions} from '../ui/Dialog/DialogActions'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {DialogTitle} from '../ui/Dialog/DialogTitle'

interface Props {
  isOpen: boolean
  onClose: () => void
  seriesTitle: string
  onConfirm: () => void
}

export const CancelSeriesConfirmationModal = (props: Props) => {
  const {isOpen, onClose, seriesTitle, onConfirm} = props
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className='md:max-w-sm'>
        <DialogTitle>Cancel scheduled meeting?</DialogTitle>
        <p className='mt-2 mb-4 text-fg-primary text-sm'>
          "{seriesTitle}" will not recur and the first meeting will not start automatically. You can
          re-schedule it later.
        </p>
        <DialogActions>
          <Button variant='outline' size='md' onClick={onClose}>
            Keep series
          </Button>
          <Button variant='primary' size='md' onClick={onConfirm}>
            Cancel series
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}
