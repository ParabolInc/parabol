import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useDocumentTitle from '../hooks/useDocumentTitle'
import {TeamInvitationErrorAccepted_verifiedInvitation$key} from '../__generated__/TeamInvitationErrorAccepted_verifiedInvitation.graphql'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import InvitationDialogCopy from './InvitationDialogCopy'
import InviteDialog from './InviteDialog'
import StyledLink from './StyledLink'

interface Props {
  verifiedInvitation: TeamInvitationErrorAccepted_verifiedInvitation$key
}

const InlineCopy = styled(InvitationDialogCopy)({
  display: 'inline-block'
})

const TeamInvitationErrorAccepted = (props: Props) => {
  const {verifiedInvitation: verifiedInvitationRef} = props
  const verifiedInvitation = useFragment(
    graphql`
      fragment TeamInvitationErrorAccepted_verifiedInvitation on VerifiedInvitationPayload {
        meetingId
        meetingName
        teamName
        teamInvitation {
          teamId
        }
      }
    `,
    verifiedInvitationRef
  )
  const {meetingId, meetingName, teamInvitation, teamName} = verifiedInvitation
  useDocumentTitle(`Token already accepted | Team Invitation`, 'Team Invitation')
  if (!teamInvitation || teamName === null) return null
  const {teamId} = teamInvitation
  return (
    <InviteDialog>
      <DialogTitle>Invitation Already Accepted</DialogTitle>
      <DialogContent>
        <InvitationDialogCopy>
          The invitation to {teamName} has already been redeemed.
        </InvitationDialogCopy>
        {meetingName ? (
          <>
            <StyledLink to={`/meet/${meetingId}`} title={`Join ${meetingName}`}>
              Join {meetingName}
            </StyledLink>{' '}
            <InlineCopy>in progress…</InlineCopy>
          </>
        ) : (
          <>
            <InlineCopy>Visit the</InlineCopy>{' '}
            <StyledLink to={`/team/${teamId}`} title='Visit the Team Dashboard'>
              Team Dashboard
            </StyledLink>
          </>
        )}
      </DialogContent>
    </InviteDialog>
  )
}

export default TeamInvitationErrorAccepted
