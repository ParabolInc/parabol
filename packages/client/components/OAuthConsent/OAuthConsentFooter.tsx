import {Button} from '../../ui/Button/Button'

interface Props {
  redirectHost: string
  canDisconnectInProfile: boolean
  errorMessage: string | null
  isAllowDisabled: boolean
  isCancelDisabled: boolean
  onAllow: () => void
  onCancel: () => void
}

const OAuthConsentFooter = (props: Props) => {
  const {redirectHost, canDisconnectInProfile, errorMessage} = props
  const {isAllowDisabled, isCancelDisabled, onAllow, onCancel} = props
  // A framed consent page could be clickjacked, so it only accepts a decision in its own window
  const isFramed = window.self !== window.top
  return (
    <>
      <p className='wrap-anywhere m-0 text-center text-[13px] text-fg-secondary leading-[18px]'>
        Either way, you’ll be sent to{' '}
        <b className='font-semibold text-fg-primary'>{redirectHost}</b>.
        {canDisconnectInProfile && ' You can disconnect it any time in My Profile.'}
      </p>
      {errorMessage && (
        <p role='alert' className='m-0 text-fg-error text-sm'>
          {errorMessage}
        </p>
      )}
      {isFramed ? (
        <p className='m-0 font-semibold text-sm'>
          To continue, open this page in its own browser window.
        </p>
      ) : (
        <div className='flex justify-end gap-3'>
          <Button variant='outline' size='md' disabled={isCancelDisabled} onClick={onCancel}>
            Cancel
          </Button>
          <Button variant='primary' size='md' disabled={isAllowDisabled} onClick={onAllow}>
            Allow
          </Button>
        </div>
      )}
    </>
  )
}

export default OAuthConsentFooter
