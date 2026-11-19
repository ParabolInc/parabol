import useDisconnectOAuthAPIGrantMutation from '../../../mutations/useDisconnectOAuthAPIGrantMutation'
import {Button} from '../../../ui/Button/Button'
import {Dialog} from '../../../ui/Dialog/Dialog'
import {DialogActions} from '../../../ui/Dialog/DialogActions'
import {DialogContent} from '../../../ui/Dialog/DialogContent'
import {DialogDescription} from '../../../ui/Dialog/DialogDescription'
import {DialogTitle} from '../../../ui/Dialog/DialogTitle'

interface Props {
  grantId: string
  appName: string
  includesPrivatePages: boolean
  onClose: () => void
  onCloseAutoFocus: (event: Event) => void
}

const DisconnectAppDialog = (props: Props) => {
  const {grantId, appName, includesPrivatePages, onClose, onCloseAutoFocus} = props
  const [disconnect, submitting] = useDisconnectOAuthAPIGrantMutation()
  const handleDisconnect = () => {
    disconnect({variables: {grantId}, onCompleted: onClose})
  }
  return (
    <Dialog isOpen onClose={onClose}>
      <DialogContent className='md:w-md md:max-w-md' onCloseAutoFocus={onCloseAutoFocus}>
        <DialogTitle>Disconnect {appName}?</DialogTitle>
        <DialogDescription className='text-fg-secondary'>
          {appName} loses access to your Parabol account in all your organizations
          {includesPrivatePages && ' and your private pages'}. Nothing it made is deleted, and you
          can connect it again from {appName}.
        </DialogDescription>
        <DialogActions>
          <Button variant='outline' size='md' onClick={onClose}>
            Cancel
          </Button>
          <Button variant='primary' size='md' disabled={submitting} onClick={handleDisconnect}>
            Disconnect
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default DisconnectAppDialog
