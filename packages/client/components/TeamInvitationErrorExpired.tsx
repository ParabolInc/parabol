import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useDocumentTitle from '../hooks/useDocumentTitle'
import {PALETTE} from '../styles/paletteV3'
import {TeamInvitationErrorExpired_verifiedInvitation$key} from '../__generated__/TeamInvitationErrorExpired_verifiedInvitation.graphql'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import InvitationDialogCopy from './InvitationDialogCopy'
import InviteDialog from './InviteDialog'

interface Props {
  verifiedInvitation: TeamInvitationErrorExpired_verifiedInvitation$key
}

const StyledEmailLink = styled('a')({
  color: PALETTE.SKY_500
})

const TeamName = styled('span')({
  fontWeight: 600,
  whiteSpace: 'nowrap'
})

const TeamInvitationErrorExpired = (props: Props) => {
  const {verifiedInvitation: verifiedInvitationRef} = props
  const verifiedInvitation = useFragment(
    graphql`
      fragment TeamInvitationErrorExpired_verifiedInvitation on VerifiedInvitationPayload {
        teamName
        inviterName
        inviterEmail
      }
    `,
    verifiedInvitationRef
  )
  const {teamName, inviterName, inviterEmail} = verifiedInvitation
  useDocumentTitle(`Token Expired | Team Invitation`, 'Team Invitation')
  return (
    <InviteDialog>
      <DialogTitle>Invitation Expired</DialogTitle>
      <DialogContent>
        <InvitationDialogCopy>
          The invitation to <TeamName>{teamName}</TeamName> has expired.
        </InvitationDialogCopy>
        <InvitationDialogCopy>
          Reach out to {inviterName} at{' '}
          <StyledEmailLink href={`mailto:${inviterEmail}`} title={`Email ${inviterEmail}`}>
            {inviterEmail}
          </StyledEmailLink>
        </InvitationDialogCopy>
        <InvitationDialogCopy>to request a new one</InvitationDialogCopy>
      </DialogContent>
    </InviteDialog>
  )
}

export default TeamInvitationErrorExpired
