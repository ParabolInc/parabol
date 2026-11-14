import {Button} from '../../../ui/Button/Button'
import {Dialog} from '../../../ui/Dialog/Dialog'
import {DialogActions} from '../../../ui/Dialog/DialogActions'
import {DialogContent} from '../../../ui/Dialog/DialogContent'
import {DialogDescription} from '../../../ui/Dialog/DialogDescription'
import {DialogTitle} from '../../../ui/Dialog/DialogTitle'

interface Props {
  title: string
  body: string
  onConfirm: () => void
  onClose: () => void
  onCloseAutoFocus?: (event: Event) => void
}

export const SyncedBlockUnsyncCopyDialog = ({
  title,
  body,
  onConfirm,
  onClose,
  onCloseAutoFocus
}: Props) => (
  <Dialog isOpen onClose={onClose}>
    <DialogContent className='md:w-md md:max-w-md' onCloseAutoFocus={onCloseAutoFocus}>
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>{body}</DialogDescription>
      <DialogActions>
        <Button variant='outline' size='md' onClick={onClose}>
          Keep synced
        </Button>
        <Button variant='primary' size='md' onClick={onConfirm}>
          Unsync and show
        </Button>
      </DialogActions>
    </DialogContent>
  </Dialog>
)
