import {Button} from '../../ui/Button/Button'
import {DialogActions} from '../../ui/Dialog/DialogActions'
import ErrorAlert from '../ErrorAlert/ErrorAlert'

interface Props {
  canDisconnectInProfile: boolean
  errorMessage: string | null
  isAllowDisabled: boolean
  isCancelDisabled: boolean
  onAllow: () => void
  onCancel: () => void
}

const OAuthConsentFooter = (props: Props) => {
  const {canDisconnectInProfile, errorMessage} = props
  const {isAllowDisabled, isCancelDisabled, onAllow, onCancel} = props
  // A framed consent page could be clickjacked, so it only accepts a decision in its own window
  const isFramed = window.self !== window.top
  return (
    <div>
      {errorMessage && <ErrorAlert message={errorMessage} />}
      {canDisconnectInProfile && (
        <p className='m-0 text-fg-secondary'>You can disconnect it any time in My Profile.</p>
      )}
      {isFramed ? (
        <p className='mt-6 mb-0 font-semibold'>
          To continue, open this page in its own browser window.
        </p>
      ) : (
        <DialogActions>
          <Button variant='outline' size='md' disabled={isCancelDisabled} onClick={onCancel}>
            Cancel
          </Button>
          <Button variant='primary' size='md' disabled={isAllowDisabled} onClick={onAllow}>
            Allow
          </Button>
        </DialogActions>
      )}
    </div>
  )
}

export default OAuthConsentFooter
