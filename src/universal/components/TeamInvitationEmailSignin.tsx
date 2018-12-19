import {TeamInvitationEmailSignin_verifiedInvitation} from '__generated__/TeamInvitationEmailSignin_verifiedInvitation.graphql'
import React from 'react'
import Helmet from 'react-helmet'
import {createFragmentContainer, graphql} from 'react-relay'
import EmailPasswordAuthForm from './EmailPasswordAuthForm'
import ForgotPasswordOneClick from './ForgotPasswordOneClick'
import InvitationCenteredCopy from './InvitationCenteredCopy'
import InvitationDialog from './InvitationDialog'
import InvitationDialogContent from './InvitationDialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import InvitationDialogTitle from './InvitationDialogTitle'

interface Props {
  verifiedInvitation: TeamInvitationEmailSignin_verifiedInvitation
}

const TeamInvitationEmailSignin = (props: Props) => {
  const {verifiedInvitation} = props
  const {user, teamInvitation, teamName} = verifiedInvitation
  if (!user || !teamInvitation) return null
  const {preferredName} = user
  const {email} = teamInvitation
  return (
    <InvitationDialog>
      <Helmet title={`Sign in | Team Invitation`} />
      <InvitationDialogTitle>Welcome back, {preferredName}!</InvitationDialogTitle>
      <InvitationDialogContent>
        <InvitationDialogCopy>
          Enter your password for immediate access to {teamName}
        </InvitationDialogCopy>
        <InvitationCenteredCopy>
          <EmailPasswordAuthForm email={email} label='Sign In' />
          <ForgotPasswordOneClick email={email} />
        </InvitationCenteredCopy>
      </InvitationDialogContent>
    </InvitationDialog>
  )
}

export default createFragmentContainer(
  TeamInvitationEmailSignin,
  graphql`
    fragment TeamInvitationEmailSignin_verifiedInvitation on VerifiedInvitationPayload {
      user {
        preferredName
      }
      teamInvitation {
        email
      }
      teamName
    }
  `
)
