import VerifyEmailMutation from 'mutations/VerifyEmailMutation'
import React, {useEffect} from 'react'
import {RouteComponentProps} from 'react-router'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import DialogTitle from './DialogTitle'
import PrimaryButton from './PrimaryButton'
import TeamInvitationWrapper from './TeamInvitationWrapper'
import DialogContent from './DialogContent'
import Ellipsis from './Ellipsis/Ellipsis'
import InvitationCenteredCopy from './InvitationCenteredCopy'
import InvitationDialogCopy from './InvitationDialogCopy'
import InviteDialog from './InviteDialog'

interface Props
  extends RouteComponentProps<{verificationToken: string; invitationToken?: string}> {}

const VerifyEmail = (props: Props) => {
  const {history, match} = props
  const {params} = match
  const {verificationToken, invitationToken} = params
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, error, submitMutation} = useMutationProps()
  useEffect(() => {
    submitMutation()
    VerifyEmailMutation(
      atmosphere,
      {verificationToken, invitationToken},
      {onCompleted, onError, history}
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
              <PrimaryButton size='medium' waiting>
                <span>Verifying now</span>
                <Ellipsis />
              </PrimaryButton>
            )}
          </InvitationCenteredCopy>
        </DialogContent>
      </InviteDialog>
    </TeamInvitationWrapper>
  )
}

export default VerifyEmail
