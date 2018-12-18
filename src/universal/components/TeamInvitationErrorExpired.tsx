import {TeamInvitationErrorExpired_verifiedInvitation} from '__generated__/TeamInvitationErrorExpired_verifiedInvitation.graphql'
import React from 'react'
import Helmet from 'react-helmet'
import {createFragmentContainer, graphql} from 'react-relay'
import InvitationDialog from './InvitationDialog'
import InvitationDialogContent from './InvitationDialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import InvitationDialogTitle from './InvitationDialogTitle'

interface Props {
  verifiedInvitation: TeamInvitationErrorExpired_verifiedInvitation
}

const TeamInvitationErrorExpired = (props: Props) => {
  const {verifiedInvitation} = props
  const {teamName, inviterName, inviterEmail} = verifiedInvitation
  return (
    <InvitationDialog>
      <Helmet title={`Token Expired | Team Invitation`} />
      <InvitationDialogTitle>Invitation Expired</InvitationDialogTitle>
      <InvitationDialogContent>
        <InvitationDialogCopy>The invitation to {teamName} has expired</InvitationDialogCopy>
        <InvitationDialogCopy>
          Reach out to {inviterName} at {inviterEmail}
        </InvitationDialogCopy>
        <InvitationDialogCopy>to request a new one</InvitationDialogCopy>
      </InvitationDialogContent>
    </InvitationDialog>
  )
}

export default createFragmentContainer(
  TeamInvitationErrorExpired,
  graphql`
    fragment TeamInvitationErrorExpired_verifiedInvitation on VerifiedInvitationPayload {
      teamName
      inviterName
      inviterEmail
    }
  `
)
