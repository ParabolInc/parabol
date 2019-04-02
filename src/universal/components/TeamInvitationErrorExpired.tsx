import {TeamInvitationErrorExpired_verifiedInvitation} from '__generated__/TeamInvitationErrorExpired_verifiedInvitation.graphql'
import React from 'react'
import styled from 'react-emotion'
import {PALETTE} from '../styles/paletteV2'
import LINK = PALETTE.LINK
import Helmet from 'react-helmet'
import {createFragmentContainer, graphql} from 'react-relay'
import BasicCard from './BasicCard'
import InvitationDialogContent from './InvitationDialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import InvitationDialogTitle from './InvitationDialogTitle'

interface Props {
  verifiedInvitation: TeamInvitationErrorExpired_verifiedInvitation
}

const StyledEmailLink = styled('a')({
  color: LINK.BLUE
})

const TeamName = styled('span')({
  fontWeight: 600,
  whiteSpace: 'nowrap'
})

const TeamInvitationErrorExpired = (props: Props) => {
  const {verifiedInvitation} = props
  const {teamName, inviterName, inviterEmail} = verifiedInvitation
  return (
    <BasicCard>
      <Helmet title={`Token Expired | Team Invitation`} />
      <InvitationDialogTitle>Invitation Expired</InvitationDialogTitle>
      <InvitationDialogContent>
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
      </InvitationDialogContent>
    </BasicCard>
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
