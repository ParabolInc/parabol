import {Button} from '../../../ui/Button/Button'
import {Dialog} from '../../../ui/Dialog/Dialog'
import {DialogActions} from '../../../ui/Dialog/DialogActions'
import {DialogContent} from '../../../ui/Dialog/DialogContent'
import {DialogDescription} from '../../../ui/Dialog/DialogDescription'
import {DialogTitle} from '../../../ui/Dialog/DialogTitle'
import type {SyncedBlockDialogRows as Rows} from './getSyncedBlockDialogRows'
import {SyncedBlockDialogRows} from './SyncedBlockDialogRows'

interface Props {
  rows: Rows['unsyncRows'] | null
  isSubmitting: boolean
  onConfirm: () => void
  onClose: () => void
  onCloseAutoFocus?: (event: Event) => void
}

export const SyncedBlockUnsyncAllDialog = ({
  rows,
  isSubmitting,
  onConfirm,
  onClose,
  onCloseAutoFocus
}: Props) => (
  <Dialog isOpen onClose={onClose}>
    <DialogContent className='md:w-md md:max-w-md' onCloseAutoFocus={onCloseAutoFocus}>
      <DialogTitle>Unsync this block everywhere?</DialogTitle>
      <DialogDescription>
        Each page gets its own text and later edits stop syncing. Pages where someone couldn't read
        it lose the block instead.
      </DialogDescription>
      <SyncedBlockDialogRows rows={rows} hasNotes />
      <DialogActions>
        <Button variant='outline' size='md' onClick={onClose}>
          Cancel
        </Button>
        <Button variant='primary' size='md' disabled={isSubmitting || !rows} onClick={onConfirm}>
          Unsync all
        </Button>
      </DialogActions>
    </DialogContent>
  </Dialog>
)
