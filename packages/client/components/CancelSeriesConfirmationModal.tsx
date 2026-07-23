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
          <button
            className='cursor-pointer rounded-md border border-hairline-strong border-solid bg-surface-card px-4 py-2 font-medium font-sans text-base text-fg-primary hover:bg-surface-hover'
            onClick={onClose}
          >
            Keep series
          </button>
          <button
            className='cursor-pointer rounded-md bg-tomato-500 px-4 py-2 font-medium font-sans text-base text-white hover:bg-tomato-600'
            onClick={onConfirm}
          >
            Cancel series
          </button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}
