import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamInvitationEmailSignin_verifiedInvitation$key} from '../__generated__/TeamInvitationEmailSignin_verifiedInvitation.graphql'
import useDocumentTitle from '../hooks/useDocumentTitle'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import EmailPasswordAuthForm from './EmailPasswordAuthForm'
import ForgotPasswordOneClick from './ForgotPasswordOneClick'
import InvitationCenteredCopy from './InvitationCenteredCopy'
import InvitationDialogCopy from './InvitationDialogCopy'
import InviteDialog from './InviteDialog'

interface Props {
  invitationToken: string
  verifiedInvitation: TeamInvitationEmailSignin_verifiedInvitation$key
}

const TeamInvitationEmailSignin = (props: Props) => {
  const {invitationToken, verifiedInvitation: verifiedInvitationRef} = props
  const verifiedInvitation = useFragment(
    graphql`
      fragment TeamInvitationEmailSignin_verifiedInvitation on VerifiedInvitationPayload {
        meetingName
        user {
          preferredName
        }
        teamInvitation {
          email
        }
        teamName
      }
    `,
    verifiedInvitationRef
  )
  const {meetingName, user, teamInvitation, teamName} = verifiedInvitation
  useDocumentTitle(`Sign in | Team Invitation`, 'Sign in')
  if (!user || !teamInvitation) return null
  const {preferredName} = user
  const {email} = teamInvitation
  return (
    <InviteDialog className='max-w-[356px]'>
      <DialogTitle>Welcome back, {preferredName}!</DialogTitle>
      <DialogContent>
        <InvitationDialogCopy>
          Enter your password
          {meetingName ? ` to join ${meetingName} for: ` : ' for immediate access to your team: '}
          <span className='whitespace-nowrap font-semibold'>{teamName}</span>
        </InvitationDialogCopy>
        <InvitationCenteredCopy>
          <EmailPasswordAuthForm
            email={email}
            isPrimary
            isSignin
            invitationToken={invitationToken}
          />
          <ForgotPasswordOneClick email={email} />
        </InvitationCenteredCopy>
      </DialogContent>
    </InviteDialog>
  )
}

export default TeamInvitationEmailSignin
