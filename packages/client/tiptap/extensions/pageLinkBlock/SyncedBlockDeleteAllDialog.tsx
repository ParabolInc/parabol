import {Button} from '../../../ui/Button/Button'
import {Dialog} from '../../../ui/Dialog/Dialog'
import {DialogActions} from '../../../ui/Dialog/DialogActions'
import {DialogContent} from '../../../ui/Dialog/DialogContent'
import {DialogDescription} from '../../../ui/Dialog/DialogDescription'
import {DialogTitle} from '../../../ui/Dialog/DialogTitle'
import type {SyncedBlockDialogRows as Rows} from './getSyncedBlockDialogRows'
import {SyncedBlockDialogRows} from './SyncedBlockDialogRows'

interface Props {
  rows: Rows | null
  hostTitle: string
  isSubmitting: boolean
  onConfirm: () => void
  onClose: () => void
  onCloseAutoFocus?: (event: Event) => void
}

export const SyncedBlockDeleteAllDialog = (props: Props) => {
  const {rows, hostTitle, isSubmitting, onConfirm, onClose, onCloseAutoFocus} = props
  return (
    <Dialog isOpen onClose={onClose}>
      <DialogContent className='md:w-md md:max-w-md' onCloseAutoFocus={onCloseAutoFocus}>
        <DialogTitle>
          {rows
            ? `Delete this block from ${rows.pageCount} pages?`
            : 'Delete this block from every page?'}
        </DialogTitle>
        <DialogDescription>
          It disappears from every page it's on and goes to Trash. Restoring it puts it back on{' '}
          {rows?.originalTitle ?? hostTitle} only.
        </DialogDescription>
        <SyncedBlockDialogRows rows={rows?.deleteRows ?? null} />
        <DialogActions>
          <Button variant='outline' size='md' onClick={onClose}>
            Cancel
          </Button>
          <Button variant='primary' size='md' disabled={isSubmitting || !rows} onClick={onConfirm}>
            Delete all
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}
