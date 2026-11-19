import {Button} from '../../../../ui/Button/Button'
import {Dialog} from '../../../../ui/Dialog/Dialog'
import {DialogActions} from '../../../../ui/Dialog/DialogActions'
import {DialogContent} from '../../../../ui/Dialog/DialogContent'
import {DialogDescription} from '../../../../ui/Dialog/DialogDescription'
import {DialogTitle} from '../../../../ui/Dialog/DialogTitle'
import type {OAuthClientType} from './OAuthClientTypeField'

interface Props {
  appName: string
  clientType: OAuthClientType
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

const OAuthClientTypeSwitchDialog = ({appName, clientType, isOpen, onClose, onConfirm}: Props) => {
  const isPublic = clientType === 'PUBLIC'
  const typeLabel = isPublic ? 'PKCE' : 'Secret'
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className='md:w-md md:max-w-md'>
        <DialogTitle>
          Switch {appName} to {typeLabel}?
        </DialogTitle>
        <DialogDescription className='text-fg-secondary'>
          {isPublic
            ? 'Its client secret is deleted, and everyone connected through this app must connect again.'
            : 'A new client secret is created, and everyone connected through this app must connect again.'}
        </DialogDescription>
        <DialogActions>
          <Button variant='outline' size='md' onClick={onClose}>
            Cancel
          </Button>
          <Button variant='primary' size='md' onClick={onConfirm}>
            Switch to {typeLabel}
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default OAuthClientTypeSwitchDialog
