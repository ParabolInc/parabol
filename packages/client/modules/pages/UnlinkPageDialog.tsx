import {Dialog} from '~/ui/Dialog/Dialog'
import {DialogActions} from '~/ui/Dialog/DialogActions'
import {DialogContent} from '~/ui/Dialog/DialogContent'
import {DialogTitle} from '~/ui/Dialog/DialogTitle'
import {Button} from '../../ui/Button/Button'

interface Props {
  approveUnlink: () => void
  closeDialog: () => void
}

export const UnlinkPageDialog = (props: Props) => {
  const {approveUnlink, closeDialog} = props
  console.log('unlink')
  return (
    <Dialog isOpen={true}>
      <DialogContent className='z-10 md:max-w-80'>
        <DialogTitle className='mb-4'>Unlink Share Settings from Parent Page?</DialogTitle>
        <div className='flex flex-col space-y-1 text-sm leading-4 text-slate-700'>
          <div>Making a page more restrictive than its parent will cause it to unlink.</div>
          <div>It will no longer inherit share settings.</div>
          <div>You can undo this at any time.</div>
        </div>
        <DialogActions>
          <Button variant='flat' shape='pill' onClick={closeDialog} className='p-2'>
            Cancel
          </Button>
          <Button variant='primary' shape='pill' onClick={approveUnlink} className='p-2'>
            Change and unlink
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}
