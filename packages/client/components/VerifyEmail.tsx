import {useNavigate, useParams} from '@tanstack/react-router'
import {useEffect, useRef} from 'react'
import useCanonical from '~/hooks/useCanonical'
import VerifyEmailMutation from '~/mutations/VerifyEmailMutation'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import {Button} from '../ui/Button/Button'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import Ellipsis from './Ellipsis/Ellipsis'
import InvitationCenteredCopy from './InvitationCenteredCopy'
import InvitationDialogCopy from './InvitationDialogCopy'
import InviteDialog from './InviteDialog'
import TeamInvitationWrapper from './TeamInvitationWrapper'

const VerifyEmail = () => {
  const navigate = useNavigate()
  const {verificationToken, invitationToken} = useParams({strict: false})
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, error, submitMutation} = useMutationProps({errorDisplay: 'inline'})
  const calledRef = useRef(false)
  useCanonical('verify-email')
  useEffect(() => {
    if (calledRef.current) return
    calledRef.current = true
    submitMutation()
    VerifyEmailMutation(
      atmosphere,
      {verificationToken: verificationToken!},
      {onCompleted, onError, navigate, invitationToken}
    )
  }, [])
  return (
    <TeamInvitationWrapper>
      <InviteDialog>
        <DialogTitle>Email Verification</DialogTitle>
        <DialogContent>
          <InvitationDialogCopy>{error ? error.message : 'You’re almost in!'}</InvitationDialogCopy>
          <InvitationCenteredCopy>
            {!error && (
              <Button variant='primary' size='md' disabled>
                <span>Verifying now</span>
                <Ellipsis />
              </Button>
            )}
          </InvitationCenteredCopy>
        </DialogContent>
      </InviteDialog>
    </TeamInvitationWrapper>
  )
}

export default VerifyEmail
