import {TeamInvitationErrorAccepted_verifiedInvitation} from '__generated__/TeamInvitationErrorAccepted_verifiedInvitation.graphql'
import React from 'react'
import styled from 'react-emotion'
import Helmet from 'react-helmet'
import {createFragmentContainer, graphql} from 'react-relay'
import InvitationDialog from './InvitationDialog'
import InvitationDialogContent from './InvitationDialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import InvitationDialogTitle from './InvitationDialogTitle'
import StyledLink from './StyledLink'

interface Props {
  verifiedInvitation: TeamInvitationErrorAccepted_verifiedInvitation
}

const InlineCopy = styled(InvitationDialogCopy)({
  display: 'inline-block'
})

const TeamInvitationErrorAccepted = (props: Props) => {
  const {verifiedInvitation} = props
  const {teamInvitation, teamName} = verifiedInvitation
  if (!teamInvitation || teamName === null) return null
  const {teamId} = teamInvitation
  return (
    <InvitationDialog>
      <Helmet title={`Token already accepted | Team Invitation`} />
      <InvitationDialogTitle>Invitation Already Accepted</InvitationDialogTitle>
      <InvitationDialogContent>
        <InvitationDialogCopy>
          The invitation to {teamName} has already been redeemed.
        </InvitationDialogCopy>
        <InlineCopy>Visit the</InlineCopy>{' '}
        <StyledLink to={`/team/${teamId}`} title='Visit the Team Dashboard'>
          Team Dashboard
        </StyledLink>
      </InvitationDialogContent>
    </InvitationDialog>
  )
}

export default createFragmentContainer(
  TeamInvitationErrorAccepted,
  graphql`
    fragment TeamInvitationErrorAccepted_verifiedInvitation on VerifiedInvitationPayload {
      teamName
      teamInvitation {
        teamId
      }
    }
  `
)
