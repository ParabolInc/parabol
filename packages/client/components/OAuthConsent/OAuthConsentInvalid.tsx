import {useNavigate} from '@tanstack/react-router'
import {Button} from '../../ui/Button/Button'
import DialogContent from '../DialogContent'
import DialogTitle from '../DialogTitle'
import InviteDialog from '../InviteDialog'
import TeamInvitationWrapper from '../TeamInvitationWrapper'

const OAuthConsentInvalid = () => {
  const navigate = useNavigate()
  return (
    <TeamInvitationWrapper>
      <InviteDialog className='w-full max-w-md'>
        <DialogTitle>This authorization request isn’t valid</DialogTitle>
        <DialogContent>
          <p className='m-0'>Go back to the app and try again.</p>
          <div className='flex justify-end pt-6'>
            <Button variant='outline' size='md' onClick={() => navigate({to: '/meetings'})}>
              Go to Parabol
            </Button>
          </div>
        </DialogContent>
      </InviteDialog>
    </TeamInvitationWrapper>
  )
}

export default OAuthConsentInvalid
