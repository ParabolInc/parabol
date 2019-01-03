import {TeamInvitationEmailCreateAccount_verifiedInvitation} from '__generated__/TeamInvitationEmailCreateAccount_verifiedInvitation.graphql'
import React from 'react'
import styled from 'react-emotion'
import Helmet from 'react-helmet'
import {createFragmentContainer, graphql} from 'react-relay'
import EmailPasswordAuthForm from './EmailPasswordAuthForm'
import InvitationCenteredCopy from './InvitationCenteredCopy'
import InvitationDialog from './InvitationDialog'
import InvitationDialogContent from './InvitationDialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import InvitationDialogTitle from './InvitationDialogTitle'

interface Props {
  verifiedInvitation: TeamInvitationEmailCreateAccount_verifiedInvitation
}

const StyledDialog = styled(InvitationDialog)({
  maxWidth: 356
})

const TeamInvitationEmailCreateAccount = (props: Props) => {
  const {verifiedInvitation} = props
  const {teamName, teamInvitation} = verifiedInvitation
  if (!teamInvitation) return null
  const {email} = teamInvitation
  return (
    <StyledDialog>
      <Helmet title={`Sign up | Team Invitation`} />
      <InvitationDialogTitle>Welcome!</InvitationDialogTitle>
      <InvitationDialogContent>
        <InvitationDialogCopy>
          Choose a password for immediate access to your team: <b>{teamName}</b>
        </InvitationDialogCopy>
        <InvitationCenteredCopy>
          <EmailPasswordAuthForm email={email} label='Create Account' />
        </InvitationCenteredCopy>
      </InvitationDialogContent>
    </StyledDialog>
  )
}

export default createFragmentContainer(
  TeamInvitationEmailCreateAccount,
  graphql`
    fragment TeamInvitationEmailCreateAccount_verifiedInvitation on VerifiedInvitationPayload {
      teamInvitation {
        email
      }
      teamName
    }
  `
)
