import {InvitationLinkErrorExpired_massInvitation} from '__generated__/InvitationLinkErrorExpired_massInvitation.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import InviteDialog from './InviteDialog'
import DialogContent from './DialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import DialogTitle from './DialogTitle'
import useDocumentTitle from 'universal/hooks/useDocumentTitle'

interface Props {
  massInvitation: InvitationLinkErrorExpired_massInvitation
}

const TeamName = styled('span')({
  fontWeight: 600,
  whiteSpace: 'nowrap'
})

const InvitationLinkErrorExpired = (props: Props) => {
  const {massInvitation} = props
  const {teamName, inviterName} = massInvitation
  useDocumentTitle(`Token Expired | Invitation Link`)
  return (
    <InviteDialog>
      <DialogTitle>Invitation Link Expired</DialogTitle>
      <DialogContent>
        <InvitationDialogCopy>
          The invitation to <TeamName>{teamName}</TeamName> has expired.
        </InvitationDialogCopy>
        <InvitationDialogCopy>Reach out to {inviterName} to request a new one</InvitationDialogCopy>
      </DialogContent>
    </InviteDialog>
  )
}

export default createFragmentContainer(InvitationLinkErrorExpired, {
  massInvitation: graphql`
    fragment InvitationLinkErrorExpired_massInvitation on MassInvitationPayload {
      teamName
      inviterName
    }
  `
})
