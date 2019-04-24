import {TeamInvitationErrorAccepted_verifiedInvitation} from '__generated__/TeamInvitationErrorAccepted_verifiedInvitation.graphql'
import React from 'react'
import styled from 'react-emotion'
import Helmet from 'react-helmet'
import {createFragmentContainer, graphql} from 'react-relay'
import BasicCard from './BasicCard'
import DialogContent from './DialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import DialogTitle from './DialogTitle'
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
    <BasicCard>
      <Helmet title={`Token already accepted | Team Invitation`} />
      <DialogTitle>Invitation Already Accepted</DialogTitle>
      <DialogContent>
        <InvitationDialogCopy>
          The invitation to {teamName} has already been redeemed.
        </InvitationDialogCopy>
        <InlineCopy>Visit the</InlineCopy>{' '}
        <StyledLink to={`/team/${teamId}`} title='Visit the Team Dashboard'>
          Team Dashboard
        </StyledLink>
      </DialogContent>
    </BasicCard>
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
