import {TeamInvitationEmailCreateAccount_verifiedInvitation} from '__generated__/TeamInvitationEmailCreateAccount_verifiedInvitation.graphql'
import React from 'react'
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

const TeamInvitationEmailCreateAccount = (props: Props) => {
  const {verifiedInvitation} = props
  const {teamName, teamInvitation} = verifiedInvitation
  if (!teamInvitation) return null
  const {email} = teamInvitation
  return (
    <InvitationDialog>
      <Helmet title={`Sign up | Team Invitation`} />
      <InvitationDialogTitle>Welcome!</InvitationDialogTitle>
      <InvitationDialogContent>
        <InvitationDialogCopy>
          Enter your password for immediate access to {teamName}
        </InvitationDialogCopy>
        <InvitationCenteredCopy>
          <EmailPasswordAuthForm email={email} label='Sign Up' />
        </InvitationCenteredCopy>
      </InvitationDialogContent>
    </InvitationDialog>
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
