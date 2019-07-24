import {TeamInvitationErrorExpired_verifiedInvitation} from '../__generated__/TeamInvitationErrorExpired_verifiedInvitation.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV2'
import Helmet from 'react-helmet'
import {createFragmentContainer, graphql} from 'react-relay'
import InviteDialog from './InviteDialog'
import DialogContent from './DialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import DialogTitle from './DialogTitle'

interface Props {
  verifiedInvitation: TeamInvitationErrorExpired_verifiedInvitation
}

const StyledEmailLink = styled('a')({
  color: PALETTE.LINK_BLUE
})

const TeamName = styled('span')({
  fontWeight: 600,
  whiteSpace: 'nowrap'
})

const TeamInvitationErrorExpired = (props: Props) => {
  const {verifiedInvitation} = props
  const {teamName, inviterName, inviterEmail} = verifiedInvitation
  return (
    <InviteDialog>
      <Helmet title={`Token Expired | Team Invitation`} />
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

export default createFragmentContainer(TeamInvitationErrorExpired, {
  verifiedInvitation: graphql`
    fragment TeamInvitationErrorExpired_verifiedInvitation on VerifiedInvitationPayload {
      teamName
      inviterName
      inviterEmail
    }
  `
})
