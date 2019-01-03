import {TeamInvitationEmailSignin_verifiedInvitation} from '__generated__/TeamInvitationEmailSignin_verifiedInvitation.graphql'
import React from 'react'
import styled from 'react-emotion'
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

const StyledDialog = styled(InvitationDialog)({
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
      <InvitationDialogTitle>Welcome back, {preferredName}!</InvitationDialogTitle>
      <InvitationDialogContent>
        <InvitationDialogCopy>
          Enter your password for immediate access to your team: <TeamName>{teamName}</TeamName>
        </InvitationDialogCopy>
        <InvitationCenteredCopy>
          <EmailPasswordAuthForm email={email} label='Sign In' />
          <ForgotPasswordOneClick email={email} />
        </InvitationCenteredCopy>
      </InvitationDialogContent>
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
