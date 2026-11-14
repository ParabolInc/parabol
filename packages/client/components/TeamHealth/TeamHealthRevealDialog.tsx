import {Button} from '../../ui/Button/Button'
import {Dialog} from '../../ui/Dialog/Dialog'
import {DialogActions} from '../../ui/Dialog/DialogActions'
import {DialogContent} from '../../ui/Dialog/DialogContent'
import {DialogDescription} from '../../ui/Dialog/DialogDescription'
import {DialogTitle} from '../../ui/Dialog/DialogTitle'
import {Warning} from '../../ui/icons'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  submitting: boolean
  pendingCount: number
}

// only shown while someone still owes a response: once the team is in, revealing needs no warning
const TeamHealthRevealDialog = (props: Props) => {
  const {isOpen, onClose, onConfirm, submitting, pendingCount} = props
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className='md:w-md md:max-w-md'>
        <DialogTitle>End Early</DialogTitle>
        <DialogDescription className='text-fg-secondary'>
          Revealing shows everyone the results and ends the meeting. There’s no way to reopen it, so
          anyone who hasn’t answered yet loses their chance to
        </DialogDescription>
        <div className='flex items-center gap-3 rounded-lg bg-gold-100 p-4 text-left dark:bg-gold-900'>
          <Warning className='shrink-0 text-gold-500' />
          <div className='font-semibold text-fg-primary text-sm'>
            {pendingCount === 1
              ? '1 teammate hasn’t answered yet'
              : `${pendingCount} teammates haven’t answered yet`}
          </div>
        </div>
        <DialogActions>
          <Button variant='outline' size='md' onClick={onClose}>
            Keep waiting
          </Button>
          <Button variant='primary' size='md' onClick={onConfirm} disabled={submitting}>
            Reveal &amp; end early
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default TeamHealthRevealDialog
