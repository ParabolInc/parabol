import {Button} from '../../../../ui/Button/Button'
import {Dialog} from '../../../../ui/Dialog/Dialog'
import {DialogActions} from '../../../../ui/Dialog/DialogActions'
import {DialogContent} from '../../../../ui/Dialog/DialogContent'
import {DialogDescription} from '../../../../ui/Dialog/DialogDescription'
import {DialogTitle} from '../../../../ui/Dialog/DialogTitle'

interface Props {
  appName: string
  memberName: string
  isUnverified: boolean
  orgName: string
  submitting: boolean
  onConfirm: () => void
  onClose: () => void
  onCloseAutoFocus: (event: Event) => void
}

const RevokeAIAppDialog = (props: Props) => {
  const {
    appName,
    memberName,
    isUnverified,
    orgName,
    submitting,
    onConfirm,
    onClose,
    onCloseAutoFocus
  } = props
  const firstName = memberName.split(' ')[0]
  return (
    <Dialog isOpen onClose={onClose}>
      <DialogContent className='md:w-md md:max-w-md' onCloseAutoFocus={onCloseAutoFocus}>
        <DialogTitle>
          Revoke {appName}’s access to {orgName}?
        </DialogTitle>
        <DialogDescription asChild className='flex flex-col gap-3 text-fg-secondary'>
          <div>
            <p className='m-0'>
              <b className='font-semibold text-fg-primary'>{memberName}’s</b> connection stops
              reaching {orgName} right away. Their other organizations keep it.
            </p>
            {isUnverified && (
              <p className='m-0'>
                {firstName} can connect it again. To keep unverified apps out, choose Verified apps.
              </p>
            )}
          </div>
        </DialogDescription>
        <DialogActions>
          <Button variant='outline' size='md' onClick={onClose}>
            Cancel
          </Button>
          <Button variant='primary' size='md' disabled={submitting} onClick={onConfirm}>
            Revoke access
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default RevokeAIAppDialog
