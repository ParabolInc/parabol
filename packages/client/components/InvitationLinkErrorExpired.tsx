import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useDocumentTitle from '../hooks/useDocumentTitle'
import useRouter from '../hooks/useRouter'
import {PALETTE} from '../styles/paletteV3'
import hasToken from '../utils/hasToken'
import {InvitationLinkErrorExpired_massInvitation} from '../__generated__/InvitationLinkErrorExpired_massInvitation.graphql'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import FlatPrimaryButton from './FlatPrimaryButton'
import InvitationDialogCopy from './InvitationDialogCopy'
import InviteDialog from './InviteDialog'

interface Props {
  massInvitation: InvitationLinkErrorExpired_massInvitation
}

const TeamName = styled('span')({
  fontWeight: 600,
  whiteSpace: 'nowrap'
})

const DialogActions = styled('div')({
  marginTop: 16
})

const StyledEmailLink = styled('a')({
  color: PALETTE.SKY_500
})

const InvitationLinkErrorExpired = (props: Props) => {
  const {massInvitation} = props
  const {teamName, inviterName, inviterEmail} = massInvitation
  useDocumentTitle(`Token Expired | Invitation Link`, 'Invitation Link')

  const path = hasToken() ? '/meetings' : '/'
  const label = hasToken() ? 'My Dashboard' : 'Sign In'
  const handleClick = () => history.push(path)

  const {history} = useRouter()

  return (
    <InviteDialog>
      <DialogTitle>Invitation Link Expired</DialogTitle>
      <DialogContent>
        <InvitationDialogCopy>
          The invitation to <TeamName>{teamName}</TeamName> has expired.
        </InvitationDialogCopy>
        <InvitationDialogCopy>
          Reach out to {inviterName} at{' '}
          <StyledEmailLink href={`mailto:${inviterEmail}`} title={`Email ${inviterEmail}`}>
            {inviterEmail}
          </StyledEmailLink>{' '}
          to request a new one
        </InvitationDialogCopy>
        <DialogActions>
          <FlatPrimaryButton onClick={handleClick} size='medium'>
            {label}
          </FlatPrimaryButton>
        </DialogActions>
      </DialogContent>
    </InviteDialog>
  )
}

export default createFragmentContainer(InvitationLinkErrorExpired, {
  massInvitation: graphql`
    fragment InvitationLinkErrorExpired_massInvitation on MassInvitationPayload {
      teamName
      inviterName
      inviterEmail
    }
  `
})
