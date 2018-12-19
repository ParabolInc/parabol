import {TeamInvitationEmailSignin_verifiedInvitation} from '__generated__/TeamInvitationEmailSignin_verifiedInvitation.graphql'
import React from 'react'
import styled from 'react-emotion'
import Helmet from 'react-helmet'
import {createFragmentContainer, graphql} from 'react-relay'
import EmailPasswordAuthForm from './EmailPasswordAuthForm'
import ForgotPasswordOneClick from './ForgotPasswordOneClick'
import InvitationDialog from './InvitationDialog'
import InvitationDialogContent from './InvitationDialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import InvitationDialogTitle from './InvitationDialogTitle'

interface Props {
  verifiedInvitation: TeamInvitationEmailSignin_verifiedInvitation
}

const CenteredCopy = styled(InvitationDialogCopy)({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  paddingTop: '1rem',
  justifyContent: 'center'
})

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
        <CenteredCopy>
          <EmailPasswordAuthForm email={email} />
          <ForgotPasswordOneClick email={email} />
        </CenteredCopy>
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
