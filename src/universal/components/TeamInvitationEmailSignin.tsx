import {TeamInvitationEmailSignin_verifiedInvitation} from '__generated__/TeamInvitationEmailSignin_verifiedInvitation.graphql'
import React from 'react'
import styled from 'react-emotion'
import Helmet from 'react-helmet'
import {createFragmentContainer, graphql} from 'react-relay'
import EmailPasswordAuthForm from './EmailPasswordAuthForm'
import ForgotPasswordOneClick from './ForgotPasswordOneClick'
import InvitationCenteredCopy from './InvitationCenteredCopy'
import InviteDialog from './InviteDialog'
import DialogContent from './DialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import DialogTitle from './DialogTitle'

interface Props {
  verifiedInvitation: TeamInvitationEmailSignin_verifiedInvitation
}

const StyledDialog = styled(InviteDialog)({
  maxWidth: 356
})

const TeamName = styled('span')({
  fontWeight: 600,
  whiteSpace: 'nowrap'
})

const TeamInvitationEmailSignin = (props: Props) => {
  const {verifiedInvitation} = props
  const {user, teamInvitation, teamName} = verifiedInvitation
  if (!user || !teamInvitation) return null
  const {preferredName} = user
  const {email} = teamInvitation
  return (
    <StyledDialog>
      <Helmet title={`Sign in | Team Invitation`} />
      <DialogTitle>Welcome back, {preferredName}!</DialogTitle>
      <DialogContent>
        <InvitationDialogCopy>
          Enter your password for immediate access to your team: <TeamName>{teamName}</TeamName>
        </InvitationDialogCopy>
        <InvitationCenteredCopy>
          <EmailPasswordAuthForm email={email} isPrimary isSignin />
          <ForgotPasswordOneClick email={email} />
        </InvitationCenteredCopy>
      </DialogContent>
    </StyledDialog>
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
